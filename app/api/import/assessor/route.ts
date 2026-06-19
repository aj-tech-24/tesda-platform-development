import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import * as xlsx from 'xlsx'
import { getAdminRole } from '@/lib/admin-role'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Authenticate
    const { data: { user } } = await supabase.auth.getUser()
    const adminRole = getAdminRole(user)
    if (!user || !adminRole || (adminRole !== 'admin' && adminRole !== 'assessment_center')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Read the file buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Parse the Excel/CSV
    const workbook = xlsx.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const rawData = xlsx.utils.sheet_to_json(sheet)
    
    let importedAssessors = 0;
    let importedAccreditations = 0;

    for (const row of rawData as any[]) {
      // 1. Process Assessor
      const assessorName = row['NAME'] || row['Name'] || row['name'] || row['Full Name'] || row['Assessor'] || row['ASSESSOR']
      if (!assessorName) continue; // Skip rows without assessor name

      let assessorId = null;

      // Check if assessor already exists in database
      const { data: existingAssessor } = await supabase
        .from('assessors')
        .select('id')
        .ilike('name', assessorName)
        .single()

      if (existingAssessor) {
        assessorId = existingAssessor.id
      } else {
        // Insert new Assessor
        const { data: newAssessor, error: assessorError } = await supabase
          .from('assessors')
          .insert({
            name: assessorName,
            region: row['REGION'] || row['Region'] || row['region'] || null,
            province: row['PROVINCE'] || row['Province'] || row['province'] || null,
            address: row['ADDRESS'] || row['Address'] || row['address'] || null,
            sector: row['SECTOR'] || row['Sector'] || row['sector'] || null,
            status: row['Status'] || row['STATUS'] || row['status'] || 'Active'
          })
          .select('id')
          .single()
        
        if (assessorError) throw new Error(`Assessor Insert Error: ${assessorError.message}`)
        assessorId = newAssessor.id
        importedAssessors++;
      }

      // 2. Process Accreditation / Qualification Details
      const qualTitle = row['QUALIFICATION TITLE'] || row['Qualification Title'] || row['qualification title'] || row['Qualification'] || row['qualification']
      if (qualTitle) {
        // Parse dates safely
        const dtAccredited = parseExcelDate(row['DATE OF ACCREDITATION'] || row['Date of Accreditation'] || row['date of accreditation'] || row['DATE ACCREDITED'] || row['Date Accredited'] || row['date accredited'])
        const dtValidUntil = parseExcelDate(row['VALID UNTIL'] || row['Valid Until'] || row['valid until'])

        // Check if this specific accreditation already exists for this assessor
        const { data: existingAccred } = await supabase
          .from('assessor_accreditations')
          .select('id')
          .eq('assessor_id', assessorId)
          .ilike('qualification_title', qualTitle)
          .single()

        if (!existingAccred) {
          const { error: accredError } = await supabase
            .from('assessor_accreditations')
            .insert({
              assessor_id: assessorId,
              qualification_title: qualTitle,
              date_accredited: dtAccredited,
              valid_until: dtValidUntil,
              status: row['Status'] || row['STATUS'] || row['status'] || 'Active'
            })

          if (accredError) throw new Error(`Accreditation Insert Error: ${accredError.message}`)
          importedAccreditations++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${importedAssessors} new assessors and ${importedAccreditations} qualification accreditations.`,
      stats: { assessors: importedAssessors, accreditations: importedAccreditations }
    })

  } catch (err: any) {
    console.error('Assessor Import Error:', err)
    return NextResponse.json({ error: err.message || 'An error occurred during import.' }, { status: 500 })
  }
}

// Helper for excel dates
function parseExcelDate(dateVal: any) {
  if (!dateVal) return null;
  if (typeof dateVal === 'number') {
    // Excel serial date format
    const date = new Date(Math.round((dateVal - 25569) * 86400 * 1000));
    return date.toISOString().split('T')[0]
  }
  
  // Try to parse string
  const d = new Date(dateVal)
  if (!isNaN(d.getTime())) return d.toISOString().split('T')[0]
  
  return null
}
