import { VaultDocument } from '../types';

export const initialSampleDocuments: VaultDocument[] = [
  {
    id: 'doc-nid-001',
    title: 'স্মার্ট জাতীয় পরিচয়পত্র (Smart NID)',
    category: 'identity',
    documentNumber: '1992269401289381',
    issuer: 'বাংলাদেশ নির্বাচন কমিশন (EC Bangladesh)',
    issueDate: '2019-04-10',
    expiryDate: '2034-04-09',
    tags: ['এনআইডি', 'পরিচয়পত্র', 'স্মার্ট কার্ড', 'ভোটার আইডি'],
    summary:
      'মালিক: মোঃ আবদুর রহিম। পিতা: মোঃ আবদুর রউফ, মাতা: সুফিয়া বেগম। জন্ম তারিখ: ১৫ অক্টোবর ১৯৯২। রক্তের গ্রুপ: B+ (পজিটিভ)। বর্তমান ঠিকানা: বাড়ি ১২, রোড ৭, ধানমন্ডি, ঢাকা ১২০৫।',
    extractedText: `গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
Government of the People's Republic of Bangladesh
National ID Card / জাতীয় পরিচয়পত্র
নাম: মোঃ আবদুর রহিম
Name: Md. Abdur Rahim
পিতা: মোঃ আবদুর রউফ
মাতা: সুফিয়া বেগম
Date of Birth: 15 Oct 1992
NID No: 1992269401289381
Blood Group: B+
ঠিকানা: বাড়ি-১২, রোড-৭, ধানমন্ডি আ/এ, ধানমন্ডি, ঢাকা-১২০৫
প্রদানের তারিখ: ১০/০৪/২০১৯
মেয়াদোত্তীর্ণের তারিখ: ০৯/০৪/২০৩৪`,
    fileName: 'nid_card_smart_abdur_rahim.pdf',
    fileSize: 482000,
    mimeType: 'application/pdf',
    isEncrypted: true,
    createdAt: '2024-01-15T10:30:00.000Z',
    updatedAt: '2024-01-15T10:30:00.000Z',
  },
  {
    id: 'doc-pass-002',
    title: 'বাংলাদেশ ই-পাসপোর্ট (Bangladesh e-Passport)',
    category: 'identity',
    documentNumber: 'A04928192',
    issuer: 'বহিরাগমন ও পাসপোর্ট অধিদপ্তর (DIP)',
    issueDate: '2021-06-15',
    expiryDate: '2031-06-14',
    tags: ['পাসপোর্ট', 'ভিসা', 'ইমিগ্রেশন', 'বিদেশ ভ্রমণ'],
    summary:
      'পাসপোর্ট নম্বর: A04928192। ধরন: P (Ordinary)। জাতীয়তা: Bangladeshi। পেশা: Software Engineer & Technical Consultant। মেয়াদ: ১৪ জুন ২০৩১ পর্যন্ত কার্যকর।',
    extractedText: `PEOPLE'S REPUBLIC OF BANGLADESH
E-PASSPORT / ই-পাসপোর্ট
Type: P | Country Code: BGD | Passport No: A04928192
Surname: RAHIM | Given Name: MD ABDUR
Nationality: BANGLADESHI
Personal No: 1992269401289381
Date of Birth: 15 OCT 1992 | Sex: M
Place of Birth: DHAKA
Date of Issue: 15 JUN 2021 | Date of Expiry: 14 JUN 2031
Issuing Authority: DIP / DHAKA
Emergency Contact: Md. Abdur Rauf (+8801711223344)`,
    fileName: 'bangladesh_epassport_a04928192.pdf',
    fileSize: 1250000,
    mimeType: 'application/pdf',
    isEncrypted: true,
    createdAt: '2024-02-10T14:15:00.000Z',
    updatedAt: '2024-02-10T14:15:00.000Z',
  },
  {
    id: 'doc-edu-003',
    title: 'বিএসসি ইঞ্জিনিয়ারিং মূল সনদপত্র (B.Sc Engineering Certificate)',
    category: 'education',
    documentNumber: 'BUET-CSE-1804021',
    issuer: 'বাংলাদেশ প্রকৌশল বিশ্ববিদ্যালয় (BUET)',
    issueDate: '2022-11-20',
    tags: ['ডিগ্রি', 'সনদপত্র', 'সার্টিফিকেট', 'সিএসই', 'বুয়েট'],
    summary:
      'কম্পিউটার সায়েন্স অ্যান্ড ইঞ্জিনিয়ারিং (CSE) অনুষদ থেকে প্রথম শ্রেণীতে বিএসসি ডিগ্রি প্রাপ্তি। রোল: ১৮০৪০২১, সিজিপিএ: ৩.৮২ (৪.০০ এর মধ্যে)।',
    extractedText: `BANGLADESH UNIVERSITY OF ENGINEERING AND TECHNOLOGY
This is to certify that
MD. ABDUR RAHIM
having completed the prescribed requirements in September 2022,
has been admitted to the degree of
BACHELOR OF SCIENCE IN COMPUTER SCIENCE AND ENGINEERING
with Honours, securing a Cumulative Grade Point Average (CGPA) of 3.82 on a scale of 4.00.
Student ID: 1804021
Controller of Examinations: Registrar BUET`,
    fileName: 'buet_cse_degree_certificate.pdf',
    fileSize: 890000,
    mimeType: 'application/pdf',
    isEncrypted: false,
    createdAt: '2024-03-01T09:00:00.000Z',
    updatedAt: '2024-03-01T09:00:00.000Z',
  },
  {
    id: 'doc-med-004',
    title: 'জরুরি প্রেসক্রিপশন ও ব্লাড টেস্ট রিপোর্ট (Medical & Allergy Record)',
    category: 'medical',
    documentNumber: 'EVR-MED-774019',
    issuer: 'এভারকেয়ার হাসপাতাল ঢাকা (Evercare Hospital)',
    issueDate: '2024-08-12',
    tags: ['চিকিৎসা', 'প্রেসক্রিপশন', 'অ্যালার্জি', 'ব্লাড টেস্ট', 'ওষুধ'],
    summary:
      'চিকিৎসক: ডাঃ ফারহানা রহমান (এমবিবিএস, এফসিপিএস - মেডিসিন)। অ্যালার্জি সতর্কতা: পেনিসিলিন এবং সালফা ড্রাগে মারাত্মক অ্যালার্জি আছে। রক্তচাপ: ১২০/৮০, হিমোগ্লোবিন: ১৪.২। প্রেসক্রিপশন: ট্যাবলেত রেনিটিডিন ও ভিটামিন ডি৩।',
    extractedText: `EVERCARE HOSPITAL DHAKA
Department of Internal Medicine
Patient: Md. Abdur Rahim | Age: 32Y | Gender: Male
Chief Complaints: Routine executive health checkup.
CRITICAL MEDICAL ALLERGY:
- Penicillin Allergy (Severe Anaphylaxis risk)
- Sulfa drugs sensitive
Vital Signs: BP 120/80 mmHg, Pulse 72 bpm, SpO2 99%
Blood Test Results:
- Hb: 14.2 g/dL
- Fasting Blood Sugar: 94 mg/dL (Normal)
- Lipid Profile: Total Cholesterol 175 mg/dL
Current Rx:
1. Cap. D-Rise 20000 IU (1 cap weekly for 8 weeks)
2. Tab. Fexo 120mg (SOS if allergic rhinitis flares)`,
    fileName: 'evercare_prescription_allergy_record.pdf',
    fileSize: 640000,
    mimeType: 'application/pdf',
    isEncrypted: true,
    createdAt: '2024-08-14T11:20:00.000Z',
    updatedAt: '2024-08-14T11:20:00.000Z',
  },
  {
    id: 'doc-bill-005',
    title: 'ডেসকো বিদ্যুৎ বিল ও মিটার রশিদ (DESCO Electricity Bill)',
    category: 'finance',
    documentNumber: 'DESCO-BILL-9940218',
    issuer: 'ঢাকা ইলেক্ট্রিক সাপ্লাই কোম্পানি (DESCO)',
    issueDate: '2024-10-05',
    expiryDate: '2024-10-25',
    tags: ['বিদ্যুৎ বিল', 'ইউটিলিটি', 'ডেসকো', 'মিটার', 'খরচ'],
    summary:
      'বিল মাস: সেপ্টেম্বর ২০২৪। গ্রাহক হিসাব নং: ০৪৯২৮১৯২, মিটার নং: এম-৮৮৩১৯। মোট ব্যবহৃত ইউনিট: ৩২০ ইউনিট। পরিশোধযোগ্য মোট বিল: ৩,৪২০ টাকা ($২৮.৫০ ডলার)। পরিশোধের শেষ তারিখ: ২৫ অক্টোবর ২০২৪।',
    extractedText: `DHAKA ELECTRIC SUPPLY COMPANY LIMITED (DESCO)
Electricity Bill for the month of September 2024
Customer Account No: 04928192 | Meter No: M-88319
Tariff: LT-A (Residential)
Previous Reading: 14,200 | Present Reading: 14,520
Total Units Consumed: 320 kWh
Energy Charge: 2,750.00 BDT
Demand Charge: 80.00 BDT
VAT (5%): 141.50 BDT
Meter Rent & Others: 448.50 BDT
Total Payable Amount: 3,420.00 BDT (Approx USD $28.50)
Payment Due Date: 25 OCT 2024`,
    fileName: 'desco_electricity_bill_sept2024.pdf',
    fileSize: 310000,
    mimeType: 'application/pdf',
    isEncrypted: false,
    createdAt: '2024-10-06T16:00:00.000Z',
    updatedAt: '2024-10-06T16:00:00.000Z',
  },
  {
    id: 'doc-tax-006',
    title: 'ই-টিন ও আয়কর রিটার্ন প্রাপ্তিস্বীকার (e-TIN & Income Tax Acknowledgement)',
    category: 'finance',
    documentNumber: 'TIN-492019482910',
    issuer: 'জাতীয় রাজস্ব বোর্ড (NBR Bangladesh)',
    issueDate: '2024-09-18',
    tags: ['আয়কর', 'টিন সার্টিফিকেট', 'ট্যাক্স রিটার্ন', 'এনবিআর', 'রাজস্ব'],
    summary:
      'কর নির্ধারণ বর্ষ: ২০২৪-২০২৫। কর অঞ্চল: ১১ ঢাকা, সার্কেল: ২৩০। ১২ ডিজিটের ই-টিন: ৪৯২০১৯৪৮২৯১০। মোট প্রদর্শিত আয়: ১৪,৫০,০০০ টাকা। মোট প্রদত্ত আয়কর: ১,১৫,০০০ টাকা। রিটার্ন দাখিল সম্পন্ন।',
    extractedText: `GOVERNMENT OF THE PEOPLE'S REPUBLIC OF BANGLADESH
NATIONAL BOARD OF REVENUE (NBR)
Income Tax Certificate & Acknowledgement Receipt
Assessment Year: 2024-2025
TIN: 492019482910
Taxpayer Name: Md. Abdur Rahim
Taxes Circle: 230 | Taxes Zone: 11, Dhaka
Total Income Declared: BDT 1,450,000
Tax Paid: BDT 115,000 (Challan No: CH-9938201)
Status: Verified & Filed successfully.`,
    fileName: 'nbr_tin_tax_acknowledgement_2024.pdf',
    fileSize: 520000,
    mimeType: 'application/pdf',
    isEncrypted: true,
    createdAt: '2024-09-20T12:00:00.000Z',
    updatedAt: '2024-09-20T12:00:00.000Z',
  },
];
