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
    
    let importedCenters = 0;
    let importedAccreditations = 0;

    for (const row of rawData as any[]) {
      // 1. Process Assessment Center
      const centerName = row['ASSESSMENT CENTER'] || row['Assessment Center'] || row['assessment center'] || row['Center Name'] || row['Center']
      if (!centerName) continue; // Skip rows without center name

      let centerId = null;

      // Check if center already exists in database
      const { data: existingCenter } = await supabase
        .from('assessment_centers')
        .select('id')
        .ilike('name', centerName)
        .single()

      if (existingCenter) {
        centerId = existingCenter.id
      } else {
        // Parse geographic coordinates safely
        const rawLon = row['LONGITUDE'] || row['Longitude'] || row['longitude'] || row['Long'] || row['long']
        const rawLat = row['LATITUDE'] || row['Latitude'] || row['latitude'] || row['Lat'] || row['lat']
        
        const longitude = rawLon ? parseFloat(rawLon) : null
        const latitude = rawLat ? parseFloat(rawLat) : null

        // Insert new Assessment Center
        const { data: newCenter, error: centerError } = await supabase
          .from('assessment_centers')
          .insert({
            name: centerName,
            region: row['Region'] || row['REGION'] || row['region'] || null,
            province: row['PROVINCE'] || row['Province'] || row['province'] || null,
            address: row['ADDRESS'] || row['Address'] || row['address'] || null,
            longitude: isNaN(longitude as number) ? null : longitude,
            latitude: isNaN(latitude as number) ? null : latitude,
            center_manager: row['CENTER MANAGER'] || row['Center Manager'] || row['center manager'] || row['Manager'] || row['manager'] || null,
            contact_no: row['TEL. NO.'] || row['TEL NO'] || row['Tel. No.'] || row['Tel No'] || row['Contact No'] || row['contact_no'] || row['Telephone'] || null,
            sector: row['SECTOR'] || row['Sector'] || row['sector'] || null,
            status: row['Status'] || row['STATUS'] || row['status'] || 'Active'
          })
          .select('id')
          .single()
        
        if (centerError) throw new Error(`Assessment Center Insert Error: ${centerError.message}`)
        centerId = newCenter.id
        importedCenters++;
      }

      // 2. Process Accreditation / Qualification Details
      const qualTitle = row['QUALIFICATION TITLE'] || row['Qualification Title'] || row['qualification title'] || row['Qualification'] || row['qualification']
      if (qualTitle) {
        // Parse dates safely
        const dtAccredited = parseExcelDate(row['DATE ACCREDITED'] || row['Date Accredited'] || row['date accredited'])
        const dtValidUntil = parseExcelDate(row['VALID UNTIL'] || row['Valid Until'] || row['valid until'])

        // Check if this specific accreditation already exists for this center
        const { data: existingAccred } = await supabase
          .from('assessment_accreditations')
          .select('id')
          .eq('assessment_center_id', centerId)
          .ilike('qualification_title', qualTitle)
          .single()

        if (!existingAccred) {
          const { error: accredError } = await supabase
            .from('assessment_accreditations')
            .insert({
              assessment_center_id: centerId,
              qualification_title: qualTitle,
              accreditation_number: row['ACCREDITATION NUMBER'] || row['Accreditation Number'] || row['accreditation number'] || row['Accreditation No'] || null,
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
      message: `Successfully imported ${importedCenters} new assessment centers and ${importedAccreditations} qualification accreditations.`,
      stats: { centers: importedCenters, accreditations: importedAccreditations }
    })

  } catch (err: any) {
    console.error('Assessment Center Import Error:', err)
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
