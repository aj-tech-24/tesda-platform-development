import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import * as xlsx from 'xlsx'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Authenticate
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.user_metadata?.is_admin !== true) {
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
    
    let importedInstitutions = 0;
    let importedPrograms = 0;
    let importedTrainers = 0;
    let importedCompliance = 0;

    for (const row of rawData as any[]) {
      // 1. Process Institution
      const instName = row['NAME OF INSTITUTION'] || row['Name of Institution'] || row['Institution Name'] || row['Institution']
      if (!instName) continue; // Skip rows without institution

      let institutionId = null;

      // Check if exists
      const { data: existingInst } = await supabase
        .from('institutions')
        .select('id')
        .ilike('name', instName)
        .single()

      if (existingInst) {
        institutionId = existingInst.id
      } else {
        // Insert
        const { data: newInst, error: instError } = await supabase
          .from('institutions')
          .insert({
            name: instName,
            province: row['PROVINCE'] || row['Province'] || null,
            municipality: row['Municipality'] || null,
            address: row['ADDRESS'] || row['Address'] || null,
            head_name: row["Name of Institution's Head"] || row['Head Name'] || null,
            contact_no: row['TEL. NO.'] || row['Contact No'] || row['Contact'] || '',
            contact_email: row['E-mail Address'] || row['Email'] || '',
            fb_account: row['FB Account'] || '',
            institution_type: row['TYPE OF INSTITUTION'] || row['TYPE (WTR/NTR/MTP/COC)'] || row['Inst Type'] || row['Institution Type'] || null,
            classification: row['CLASSIFICATION OF INSTITUTION'] || row['Class'] || row['Classification'] || null,
            status: row['STATUS'] || row['Status'] || 'Active',
            sector: row['SECTOR'] || row['Sector'] || null
          })
          .select('id')
          .single()
        
        if (instError) throw new Error(`Institution Insert Error: ${instError.message}`)
        institutionId = newInst.id
        importedInstitutions++;
      }

      // 2. Process Program
      const progName = row['COURSE/REGISTERED PROGRAM (WTR/CoC)'] || row['COURSE/REGISTERED PROGRAM (NTR/Bundled)'] || row['Registered Programs'] || row['Program Name'] || row['Program'] || row['Title']
      let programId = null;

      if (progName) {
        const { data: existingProg } = await supabase
          .from('programs')
          .select('id')
          .eq('institution_id', institutionId)
          .ilike('title', progName)
          .single()

        if (existingProg) {
          programId = existingProg.id
        } else {
          // Parse Dates
          const dtIssued = parseExcelDate(row['DATE ISSUED'] || row['Date Issued'])
          const dtExpire = parseExcelDate(row['EXPIRATION DATE'] || row['Validity Date'] || row['Expiration Date'] || row['Expiry'])

          const { data: newProg, error: progError } = await supabase
            .from('programs')
            .insert({
              institution_id: institutionId,
              title: progName,
              description: row['Description'] || '',
              qualification_level: row['Qualification Code'] || row['TYPE (WTR/NTR/MTP/COC)'] || row['Qual Code'] || row['Qualification Level'] || null,
              duration_hours: parseInt(row['DURATION'] || row['Number of Hours'] || row['Duration']) || 0,
              registration_no: row['PROGRAM REG. NO.'] || row['Program Registration Number'] || row['Reg No'] || row['Registration No'] || null,
              date_issued: dtIssued,
              expiration_date: dtExpire,
              delivery_mode: row['DELIVERY MODE'] || row['Delivery Mode'] || null,
              program_type: row['Program Type (MCC, RCEF, etc.)'] || row['Program Type\n(MCC, RCEF, etc.)'] || row['Prog Type'] || row['Program Type'] || null
            })
            .select('id')
            .single()

          if (progError) throw new Error(`Program Insert Error: ${progError.message}`)
          programId = newProg.id
          importedPrograms++;
        }
      }

      // 3. Process Trainer
      const trainerName = row['Trainer'] || row['Trainer Name']
      if (trainerName) {
        const { data: existingTrainer } = await supabase
          .from('trainers')
          .select('id')
          .eq('institution_id', institutionId)
          .ilike('full_name', trainerName)
          .single()

        if (!existingTrainer) {
          const nttcVal = parseExcelDate(row['Validity'] || row['NTTC Validity Date'] || row['NTTC Validity'])

          const { error: trainerError } = await supabase
            .from('trainers')
            .insert({
              institution_id: institutionId,
              full_name: trainerName,
              nttc_no: row['NTTC No.'] || row['NTTC Number'] || row['NTTC No'] || null,
              nttc_validity: nttcVal,
              specialization: row['Specialization'] || progName || 'General',
            })
          
          if (trainerError) throw new Error(`Trainer Insert Error: ${trainerError.message}`)
          importedTrainers++;
        }
      }

      // 4. Process Compliance Records (if CTPR provided)
      const ctprSerial = row['CTPR Serial Number']
      if (ctprSerial && programId) {
        // Check if exists
        const { data: existingCompliance } = await supabase
          .from('compliance_records')
          .select('id')
          .eq('program_id', programId)
          .eq('ctpr_serial', ctprSerial)
          .single()

        if (!existingCompliance) {
          const dateReported = parseExcelDate(row['Date Reported to CO'] || row['Reported to CO'])
          
          const { error: compError } = await supabase
            .from('compliance_records')
            .insert({
              program_id: programId,
              ctpr_serial: ctprSerial,
              audit_remarks: row['COMPLIANCE AUDIT REMARKS'] || row['Comments'] || null,
              date_reported: dateReported,
              remarks: row['Remarks'] || row['TYPE of REPORT'] || row['New Issuance / Re-Issuance'] || null
            })
          
          if (compError) throw new Error(`Compliance Insert Error: ${compError.message}`)
          importedCompliance++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${importedInstitutions} new institutions, ${importedPrograms} programs, ${importedTrainers} trainers, and ${importedCompliance} compliance records.`,
      stats: { institutions: importedInstitutions, programs: importedPrograms, trainers: importedTrainers, compliance: importedCompliance }
    })

  } catch (err: any) {
    console.error('Import Error:', err)
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
