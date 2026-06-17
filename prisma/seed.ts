import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import bcrypt from 'bcryptjs'

// Load .env file
const envPath = resolve('.env')
try {
  const envContent = readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      let value = match[2].trim()
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  })
} catch (e) {
  console.error('Error loading .env file')
}

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 10000,
  })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    console.log('Connecting to Neon database...')
    await prisma.$connect()
    console.log('✓ Connected successfully')
    console.log('Seeding Healix database...')
    const hash = await bcrypt.hash('admin123', 12)
    const custHash = await bcrypt.hash('customer123', 12)

    // Admins
    await prisma.admin.createMany({
      data: [
        { name: 'Admin User', email: 'admin@healix.com', password_hash: hash },
      ], skipDuplicates: true
    })

    // Categories
    const cats = ['Pain Relief', 'Antibiotics', 'Vitamins', 'Cardiac', 'Diabetes', 'Respiratory', 'Dermatology', 'Gastrointestinal', 'Neurology', 'Supplements']
    for (const c of cats) {
      await prisma.category.upsert({ where: { category_id: cats.indexOf(c) + 1 }, update: {}, create: { category_name: c, description: `${c} medicines` } })
    }

    // Default customer
    await prisma.customer.upsert({
      where: { email: 'customer@healix.com' },
      update: {},
      create: { full_name: 'John Customer', email: 'customer@healix.com', password_hash: custHash, phone: '9876543210', gender: 'Male', address: '123 Main St, Mumbai', membership_tier: 'Premium', reward_points: 150 }
    })

    // 50 Customers
    const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Ananya', 'Diya', 'Myra', 'Sara', 'Aanya', 'Aadhya', 'Isha', 'Kiara', 'Riya', 'Priya', 'Rahul', 'Amit', 'Vikram', 'Suresh', 'Raj', 'Neha', 'Pooja', 'Kavya', 'Meera', 'Sneha', 'Rohan', 'Karan', 'Dev', 'Nikhil', 'Sanjay', 'Deepa', 'Lakshmi', 'Gayatri', 'Nandini', 'Pallavi', 'Manish', 'Gaurav', 'Akash', 'Pankaj', 'Vishal', 'Swati', 'Jyoti', 'Rekha', 'Sunita', 'Geeta']
    const lastNames = ['Sharma', 'Patel', 'Singh', 'Kumar', 'Reddy', 'Gupta', 'Joshi', 'Verma', 'Iyer', 'Nair']
    for (let i = 0; i < 48; i++) {
      const fn = firstNames[i % firstNames.length]
      const ln = lastNames[i % lastNames.length]
      const tiers = ['Standard', 'Premium', 'Gold']
      try {
        await prisma.customer.create({
          data: {
            full_name: `${fn} ${ln}`,
            email: `${fn.toLowerCase()}${i}@example.com`,
            password_hash: custHash,
            phone: `98${String(i).padStart(8, '0')}`,
            gender: i % 2 === 0 ? 'Male' : 'Female',
            address: `${100 + i} Street, City ${i % 5}`,
            membership_tier: tiers[i % 3],
            reward_points: Math.floor(Math.random() * 500),
            dob: new Date(1985 + (i % 20), i % 12, (i % 28) + 1)
          }
        })
      } catch (e) { /* skip duplicates */ }
    }

    // 100 Medicines
    const meds = [
      ['Paracetamol', '500mg', 'Sun Pharma', 25, false, 1], ['Amoxicillin', '250mg', 'Cipla', 85, true, 2], ['Vitamin C', '1000mg', 'Himalaya', 120, false, 3],
      ['Aspirin', '75mg', 'Bayer', 30, false, 1], ['Azithromycin', '500mg', 'Zydus', 95, true, 2], ['Vitamin D3', '60000IU', 'HealthVit', 150, false, 3],
      ['Ibuprofen', '400mg', 'Alkem', 35, false, 1], ['Ciprofloxacin', '500mg', 'Dr Reddys', 110, true, 2], ['Calcium', '500mg', 'Shelcal', 180, false, 3],
      ['Metformin', '500mg', 'USV', 45, true, 5], ['Atorvastatin', '10mg', 'Ranbaxy', 90, true, 4], ['Omeprazole', '20mg', 'Cadila', 55, false, 8],
      ['Amlodipine', '5mg', 'Lupin', 65, true, 4], ['Losartan', '50mg', 'Torrent', 70, true, 4], ['Cetirizine', '10mg', 'Cipla', 20, false, 7],
      ['Montelukast', '10mg', 'Sun Pharma', 85, true, 6], ['Pantoprazole', '40mg', 'Alkem', 60, false, 8], ['Metoprolol', '50mg', 'Intas', 55, true, 4],
      ['Telmisartan', '40mg', 'Glenmark', 75, true, 4], ['Glimepiride', '2mg', 'Sanofi', 80, true, 5],
      ['Clopidogrel', '75mg', 'Sun Pharma', 95, true, 4], ['Rosuvastatin', '10mg', 'AstraZeneca', 110, true, 4], ['Levothyroxine', '50mcg', 'Abbott', 45, true, 9],
      ['Diclofenac', '50mg', 'Novartis', 30, false, 1], ['Ranitidine', '150mg', 'GSK', 40, false, 8], ['Domperidone', '10mg', 'Cipla', 35, false, 8],
      ['Salbutamol', '100mcg', 'Cipla', 120, true, 6], ['Prednisolone', '10mg', 'Cadila', 55, true, 7], ['Gabapentin', '300mg', 'Pfizer', 95, true, 9],
      ['Fluconazole', '150mg', 'Zydus', 65, true, 7], ['Iron Folic', 'Tab', 'Alkem', 30, false, 3], ['Zinc', '20mg', 'Himalaya', 25, false, 10],
      ['Omega 3', '1000mg', 'HealthVit', 250, false, 10], ['Multivitamin', 'Tab', 'Revital', 180, false, 3], ['Probiotics', 'Cap', 'Yakult', 220, false, 10],
      ['Doxycycline', '100mg', 'Sun Pharma', 75, true, 2], ['Cefixime', '200mg', 'Mankind', 90, true, 2], ['Levofloxacin', '500mg', 'Cipla', 100, true, 2],
      ['Metronidazole', '400mg', 'Abbott', 40, true, 2], ['Aceclofenac', '100mg', 'IPCA', 45, false, 1],
      ['Tramadol', '50mg', 'Sun Pharma', 65, true, 1], ['Pregabalin', '75mg', 'Torrent', 85, true, 9], ['Duloxetine', '30mg', 'Lupin', 110, true, 9],
      ['Sertraline', '50mg', 'Zydus', 95, true, 9], ['Escitalopram', '10mg', 'Cipla', 80, true, 9], ['Clonazepam', '0.5mg', 'Sun Pharma', 45, true, 9],
      ['Insulin Glargine', '100IU', 'Sanofi', 650, true, 5], ['Sitagliptin', '100mg', 'MSD', 180, true, 5], ['Voglibose', '0.3mg', 'Ranbaxy', 95, true, 5],
      ['Pioglitazone', '15mg', 'Takeda', 70, true, 5], ['Empagliflozin', '10mg', 'Boehringer', 220, true, 5],
      ['Ramipril', '5mg', 'Sanofi', 55, true, 4], ['Diltiazem', '30mg', 'Intas', 60, true, 4], ['Furosemide', '40mg', 'Aventis', 35, true, 4],
      ['Spironolactone', '25mg', 'RPG', 50, true, 4], ['Digoxin', '0.25mg', 'GSK', 40, true, 4],
      ['Budesonide', '200mcg', 'AstraZeneca', 180, true, 6], ['Fluticasone', '125mcg', 'GSK', 210, true, 6], ['Theophylline', '300mg', 'Lupin', 65, true, 6],
      ['Deriphylline', '150mg', 'Zydus', 55, true, 6], ['Ambroxol', '30mg', 'Cipla', 30, false, 6],
      ['Clobetasol', '0.05%', 'GSK', 85, true, 7], ['Mupirocin', '2%', 'GSK', 110, true, 7], ['Ketoconazole', '2%', 'Cipla', 75, false, 7],
      ['Clotrimazole', '1%', 'Bayer', 45, false, 7], ['Adapalene', '0.1%', 'Galderma', 160, true, 7],
      ['Ondansetron', '4mg', 'Sun Pharma', 50, false, 8], ['Loperamide', '2mg', 'J&J', 35, false, 8], ['Sucralfate', '1gm', 'Sun Pharma', 65, false, 8],
      ['Lactulose', '10ml', 'Abbott', 80, false, 8], ['Mesalamine', '400mg', 'Sun Pharma', 120, true, 8],
      ['Biotin', '10000mcg', 'HealthVit', 350, false, 10], ['Ashwagandha', '500mg', 'Himalaya', 200, false, 10], ['Melatonin', '3mg', 'Nature Made', 280, false, 10],
      ['Collagen', '1000mg', 'OZiva', 450, false, 10], ['Whey Protein', '30gm', 'MuscleBlaze', 60, false, 10],
      ['Diazepam', '5mg', 'Abbott', 40, true, 9], ['Carbamazepine', '200mg', 'Novartis', 55, true, 9], ['Levetiracetam', '500mg', 'Sun Pharma', 95, true, 9],
      ['Phenytoin', '100mg', 'Abbott', 35, true, 9], ['Topiramate', '25mg', 'J&J', 75, true, 9],
      ['Glipizide', '5mg', 'Pfizer', 50, true, 5], ['Dapagliflozin', '10mg', 'AstraZeneca', 200, true, 5],
      ['Acarbose', '50mg', 'Bayer', 60, true, 5], ['Teneligliptin', '20mg', 'Glenmark', 150, true, 5], ['Canagliflozin', '100mg', 'J&J', 250, true, 5],
      ['Chlorpheniramine', '4mg', 'GSK', 15, false, 6], ['Fexofenadine', '120mg', 'Sanofi', 85, false, 6],
      ['Mometasone', '0.1%', 'MSD', 130, true, 7], ['Terbinafine', '250mg', 'Novartis', 95, true, 7],
      ['Hydroxychloroquine', '200mg', 'IPCA', 45, true, 1], ['Colchicine', '0.5mg', 'Sun Pharma', 55, true, 1],
      ['Allopurinol', '100mg', 'Zydus', 30, false, 1], ['Etoricoxib', '90mg', 'MSD', 85, true, 1],
      ['Naproxen', '500mg', 'Bayer', 40, false, 1], ['Piroxicam', '20mg', 'Pfizer', 35, false, 1],
      ['Methcobalamin', '1500mcg', 'Mankind', 65, false, 3], ['Folic Acid', '5mg', 'Sun Pharma', 20, false, 3],
      ['Vitamin E', '400IU', 'HealthVit', 130, false, 3], ['Vitamin B Complex', 'Tab', 'Becosules', 35, false, 3],
    ]

    for (let i = 0; i < meds.length; i++) {
      const [name, strength, mfr, price, rx, catId] = meds[i]
      const mfgDate = new Date(2024, Math.floor(Math.random() * 12), 1)
      const expDate = new Date(2025 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 12), 28)
      try {
        const med = await prisma.medicine.create({
          data: {
            medicine_name: name as string, strength: strength as string, manufacturer: mfr as string,
            price: price as number, requires_prescription: rx as boolean, category_id: catId as number,
            manufacturing_date: mfgDate, expiry_date: expDate,
            description: `${name} ${strength} by ${mfr}. Used for treatment.`,
            image_url: `/medicines/med${(i % 10) + 1}.svg`
          }
        })
        await prisma.inventory.create({
          data: { medicine_id: med.medicine_id, stock_quantity: Math.floor(Math.random() * 200) + 5, reorder_level: 15 + Math.floor(Math.random() * 20) }
        })
      } catch (e) { /* skip */ }
    }

    // 20 Suppliers
    const suppliers = ['PharmaCorp India', 'MediSupply Ltd', 'HealthFirst Wholesale', 'DrugStore Direct', 'PillPoint Traders', 'MedLine Distribution', 'CureAll Supplies', 'RxWholesale India', 'PharmaLink Corp', 'VitalMeds Trading', 'BioPharm Supplies', 'GenericMeds Ltd', 'MediPharma Hub', 'WellCare Distributors', 'LifeLine Pharma', 'CoreMed Supplies', 'ApexPharma Trading', 'NovaMed Wholesale', 'PrimeCare Supply', 'UniPharma Corp']
    for (let i = 0; i < suppliers.length; i++) {
      try {
        await prisma.supplier.create({
          data: { supplier_name: suppliers[i], email: `contact@${suppliers[i].toLowerCase().replace(/\s/g, '')}.com`, phone: `91${String(7000000000 + i * 111111)}`, address: `Plot ${i + 1}, Industrial Area, City` }
        })
      } catch (e) { }
    }

    // Supplier-Medicine links
    const allMeds = await prisma.medicine.findMany()
    const allSuppliers = await prisma.supplier.findMany()
    for (let i = 0; i < Math.min(allMeds.length, 80); i++) {
      const sup = allSuppliers[i % allSuppliers.length]
      try {
        await prisma.supplierMedicine.create({
          data: { supplier_id: sup.supplier_id, medicine_id: allMeds[i].medicine_id, purchase_price: Number(allMeds[i].price) * 0.7 }
        })
      } catch (e) { }
    }

    // Prescriptions
    const customers = await prisma.customer.findMany()
    for (let i = 0; i < 50; i++) {
      const cust = customers[i % customers.length]
      const statuses = ['Verified', 'Pending', 'Rejected']
      try {
        await prisma.prescription.create({
          data: { customer_id: cust.customer_id, doctor_name: `Dr. ${firstNames[(i + 5) % firstNames.length]}`, doctor_registration_number: `MCI${10000 + i}`, issue_date: new Date(2025, i % 12, (i % 28) + 1), verification_status: statuses[i % 3] }
        })
      } catch (e) { }
    }

    // Orders, items, payments, deliveries
    const prescriptions = await prisma.prescription.findMany()
    const orderStatuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled']
    const payStatuses = ['Successful', 'Pending', 'Failed']
    const delStatuses = ['Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered']

    for (let i = 0; i < 200; i++) {
      const cust = customers[i % customers.length]
      const presc = i % 3 === 0 ? prescriptions[i % prescriptions.length] : null
      const itemCount = 1 + Math.floor(Math.random() * 4)
      let subtotal = 0
      try {
        const order = await prisma.order.create({
          data: {
            customer_id: cust.customer_id,
            prescription_id: presc?.prescription_id || null,
            order_date: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
            order_status: orderStatuses[i % 5],
            subtotal: 0, discount: 0, total_amount: 0
          }
        })

        for (let j = 0; j < itemCount; j++) {
          const med = allMeds[(i * 3 + j) % allMeds.length]
          const qty = 1 + Math.floor(Math.random() * 5)
          const itemTotal = Number(med.price) * qty
          subtotal += itemTotal
          await prisma.orderItem.create({
            data: { order_id: order.order_id, medicine_id: med.medicine_id, quantity: qty, unit_price: Number(med.price), item_total: itemTotal }
          })
        }

        const discount = cust.membership_tier === 'Premium' ? subtotal * 0.1 : cust.membership_tier === 'Gold' ? subtotal * 0.05 : 0
        const total = subtotal - discount
        await prisma.order.update({ where: { order_id: order.order_id }, data: { subtotal, discount, total_amount: total } })

        // Payment (for first 100)
        if (i < 100) {
          const modes = ['Online', 'UPI', 'Card', 'Net Banking', 'COD']
          await prisma.payment.create({
            data: { order_id: order.order_id, payment_mode: modes[i % 5], payment_amount: total, payment_status: payStatuses[i % 3], payment_date: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1) }
          })
        }

        // Delivery (for first 100)
        if (i < 100) {
          await prisma.delivery.create({
            data: { order_id: order.order_id, delivery_address: cust.address || 'N/A', delivery_date: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1), delivery_fee: 49, delivery_status: delStatuses[i % 5] }
          })
        }
      } catch (e) { /* skip */ }
    }

    // Reward transactions
    for (let i = 0; i < 50; i++) {
      const cust = customers[i % customers.length]
      try {
        await prisma.rewardTransaction.create({
          data: { customer_id: cust.customer_id, points_earned: 10 + Math.floor(Math.random() * 50), points_used: Math.floor(Math.random() * 20), transaction_date: new Date(2025, i % 12, (i % 28) + 1) }
        })
      } catch (e) { }
    }

    console.log('Seeding complete!')
  } catch (error) {
    console.error('Seeding error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
