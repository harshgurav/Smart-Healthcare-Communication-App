from sqlalchemy import inspect, text
from app.database import engine, SessionLocal, Base
from app.models.patient import Patient, MedicalHistory
from app.models.visit import Visit, Prescription
from app.models.document import Document
from app.models.medicine import Medicine
from app.models.clinic import ClinicSettings
from app.routers.clinic import DEFAULT_CLINIC_SETTINGS

INDIAN_CLINIC_MEDICINES = [
    # Analgesics, Antipyretics & NSAIDs
    ("Paracetamol", "500mg", "Tablet"),
    ("Paracetamol", "650mg", "Tablet"),
    ("Paracetamol (Dolo 650)", "650mg", "Tablet"),
    ("Paracetamol Paediatric", "250mg/5ml", "Syrup"),
    ("Paracetamol Drops", "100mg/ml", "Drops"),
    ("Ibuprofen", "400mg", "Tablet"),
    ("Ibuprofen + Paracetamol (Combiflam)", "400mg/325mg", "Tablet"),
    ("Ibuprofen Suspension", "100mg/5ml", "Syrup"),
    ("Aceclofenac", "100mg", "Tablet"),
    ("Aceclofenac + Paracetamol (Zerodol-P)", "100mg/325mg", "Tablet"),
    ("Aceclofenac + Paracetamol + Serratiopeptidase (Zerodol-SP)", "100mg/325mg/15mg", "Tablet"),
    ("Aceclofenac + Thiocolchicoside (Zerodol-TH)", "100mg/4mg", "Tablet"),
    ("Diclofenac Sodium", "50mg", "Tablet"),
    ("Diclofenac SR", "100mg", "Tablet"),
    ("Diclofenac + Paracetamol", "50mg/325mg", "Tablet"),
    ("Diclofenac Gel (Volini)", "1% w/w", "Gel"),
    ("Mefenamic Acid (Meftal)", "500mg", "Tablet"),
    ("Mefenamic Acid + Dicyclomine (Meftal-Spas)", "250mg/10mg", "Tablet"),
    ("Mefenamic Acid Suspension (Meftal-P)", "100mg/5ml", "Syrup"),
    ("Naproxen", "250mg", "Tablet"),
    ("Naproxen", "500mg", "Tablet"),
    ("Naproxen + Domperidone (Naxdom)", "500mg/10mg", "Tablet"),
    ("Etoricoxib", "60mg", "Tablet"),
    ("Etoricoxib", "90mg", "Tablet"),
    ("Etoricoxib + Thiocolchicoside", "60mg/4mg", "Tablet"),
    ("Tramadol + Paracetamol (Ultracet)", "37.5mg/325mg", "Tablet"),
    ("Piroxicam Dispersible", "20mg", "Tablet"),
    ("Nimesulide", "100mg", "Tablet"),

    # Antibiotics & Antimicrobials
    ("Amoxicillin", "250mg", "Capsule"),
    ("Amoxicillin", "500mg", "Capsule"),
    ("Amoxicillin Dry Syrup", "125mg/5ml", "Syrup"),
    ("Amoxicillin + Clavulanic Acid (Augmentin 625)", "500mg/125mg", "Tablet"),
    ("Amoxicillin + Clavulanic Acid", "875mg/125mg", "Tablet"),
    ("Amoxicillin + Clavulanic Acid Duo", "228.5mg/5ml", "Syrup"),
    ("Azithromycin", "250mg", "Tablet"),
    ("Azithromycin", "500mg", "Tablet"),
    ("Azithromycin Oral Suspension", "200mg/5ml", "Syrup"),
    ("Cefixime", "100mg", "Tablet"),
    ("Cefixime", "200mg", "Tablet"),
    ("Cefixime + Ofloxacin", "200mg/200mg", "Tablet"),
    ("Cefixime Dry Syrup", "50mg/5ml", "Syrup"),
    ("Cefpodoxime Proxetil", "100mg", "Tablet"),
    ("Cefpodoxime Proxetil", "200mg", "Tablet"),
    ("Cefpodoxime Dry Syrup", "50mg/5ml", "Syrup"),
    ("Cefuroxime Axetil", "250mg", "Tablet"),
    ("Cefuroxime Axetil", "500mg", "Tablet"),
    ("Cephalexin", "250mg", "Capsule"),
    ("Cephalexin", "500mg", "Capsule"),
    ("Cefadroxil", "500mg", "Tablet"),
    ("Ciprofloxacin", "250mg", "Tablet"),
    ("Ciprofloxacin", "500mg", "Tablet"),
    ("Ciprofloxacin + Tinidazole (Ciplox-TZ)", "500mg/600mg", "Tablet"),
    ("Ofloxacin", "200mg", "Tablet"),
    ("Ofloxacin", "400mg", "Tablet"),
    ("Ofloxacin + Ornidazole (O2)", "200mg/500mg", "Tablet"),
    ("Norfloxacin", "400mg", "Tablet"),
    ("Norfloxacin + Tinidazole (Norflox-TZ)", "400mg/600mg", "Tablet"),
    ("Levofloxacin", "500mg", "Tablet"),
    ("Levofloxacin", "750mg", "Tablet"),
    ("Moxifloxacin", "400mg", "Tablet"),
    ("Doxycycline", "100mg", "Capsule"),
    ("Clarithromycin", "250mg", "Tablet"),
    ("Clarithromycin", "500mg", "Tablet"),
    ("Clindamycin", "300mg", "Capsule"),
    ("Linezolid", "600mg", "Tablet"),
    ("Nitrofurantoin SR", "100mg", "Tablet"),
    ("Cotrimoxazole (Septran DS)", "800mg/160mg", "Tablet"),
    ("Metronidazole (Flagyl)", "400mg", "Tablet"),
    ("Metronidazole Suspension", "200mg/5ml", "Syrup"),
    ("Ornidazole", "500mg", "Tablet"),
    ("Rifaximin", "400mg", "Tablet"),
    ("Albendazole", "400mg", "Tablet"),
    ("Albendazole Suspension", "200mg/5ml", "Syrup"),
    ("Ivermectin", "12mg", "Tablet"),
    ("Mebendazole", "100mg", "Tablet"),
    ("Fluconazole", "150mg", "Tablet"),
    ("Fluconazole", "200mg", "Tablet"),
    ("Itraconazole", "100mg", "Capsule"),
    ("Itraconazole", "200mg", "Capsule"),
    ("Terbinafine", "250mg", "Tablet"),
    ("Acyclovir", "400mg", "Tablet"),
    ("Acyclovir", "800mg", "Tablet"),
    ("Oseltamivir", "75mg", "Capsule"),

    # Gastrointestinal, Antacids, Antiemetics & Laxatives
    ("Pantoprazole (Pan 40)", "40mg", "Tablet"),
    ("Pantoprazole + Domperidone (Pan-D)", "40mg/30mg", "Capsule"),
    ("Pantoprazole + Levosulpiride", "40mg/75mg", "Capsule"),
    ("Rabeprazole (Razo 20)", "20mg", "Tablet"),
    ("Rabeprazole + Domperidone (Razo-D)", "20mg/30mg", "Capsule"),
    ("Rabeprazole + Itopride", "20mg/150mg", "Capsule"),
    ("Omeprazole (Omez)", "20mg", "Capsule"),
    ("Omeprazole + Domperidone (Omez-D)", "20mg/10mg", "Capsule"),
    ("Esomeprazole (Nexpro)", "40mg", "Tablet"),
    ("Esomeprazole + Domperidone", "40mg/30mg", "Capsule"),
    ("Famotidine", "20mg", "Tablet"),
    ("Famotidine", "40mg", "Tablet"),
    ("Sucralfate Suspension", "1g/10ml", "Syrup"),
    ("Sucralfate + Oxetacaine (Sucrafil-O)", "1g/20mg", "Syrup"),
    ("Antacid Gel (Digene)", "10ml", "Syrup"),
    ("Magaldrate + Simethicone (Gelusil MPS)", "400mg/20mg", "Syrup"),
    ("Sodium Alginate + Sodium Bicarbonate (Gaviscon)", "10ml", "Syrup"),
    ("Ondansetron (Emeset)", "4mg", "Tablet"),
    ("Ondansetron MD", "8mg", "Tablet"),
    ("Ondansetron Syrup", "2mg/5ml", "Syrup"),
    ("Domperidone", "10mg", "Tablet"),
    ("Drotaverine (Drotin)", "40mg", "Tablet"),
    ("Drotaverine DS (Drotin DS)", "80mg", "Tablet"),
    ("Drotaverine + Mefenamic Acid (Drotin-M)", "80mg/250mg", "Tablet"),
    ("Hyoscine Butylbromide (Buscopan)", "10mg", "Tablet"),
    ("ORS (Oral Rehydration Salts - Electral)", "21.8g", "Sachet"),
    ("Racecadotril", "100mg", "Capsule"),
    ("Racecadotril Sachet", "15mg", "Sachet"),
    ("Loperamide", "2mg", "Tablet"),
    ("Saccharomyces Boulardii (Econorm)", "250mg", "Sachet"),
    ("Bacillus Clausii Spores (Enterogermina)", "2 Billion/5ml", "Suspension"),
    ("Pre & Probiotic (Vizylac)", "Standard", "Capsule"),
    ("Digestive Enzymes (Aristozyme)", "Standard", "Capsule"),
    ("Digestive Enzymes Syrup (Aristozyme)", "5ml", "Syrup"),
    ("Simethicone + Activated Charcoal", "80mg", "Tablet"),
    ("Ursodeoxycholic Acid (Udiliv)", "150mg", "Tablet"),
    ("Ursodeoxycholic Acid (Udiliv)", "300mg", "Tablet"),
    ("Lactulose Solution (Duphalac)", "10g/15ml", "Syrup"),
    ("Liquid Paraffin + Milk of Magnesia (Cremaffin)", "15ml", "Syrup"),
    ("Bisacodyl (Dulcolax)", "5mg", "Tablet"),
    ("Ispaghula Husk", "3.5g", "Sachet"),

    # Anti-allergic, Cough, Cold & Respiratory
    ("Cetirizine", "10mg", "Tablet"),
    ("Cetirizine Syrup", "5mg/5ml", "Syrup"),
    ("Levocetirizine", "5mg", "Tablet"),
    ("Levocetirizine Syrup", "2.5mg/5ml", "Syrup"),
    ("Montelukast + Levocetirizine (Montair-LC)", "10mg/5mg", "Tablet"),
    ("Montelukast + Levocetirizine Kid", "4mg/2.5mg", "Tablet"),
    ("Montelukast + Fexofenadine", "10mg/120mg", "Tablet"),
    ("Fexofenadine (Allegra)", "120mg", "Tablet"),
    ("Fexofenadine (Allegra)", "180mg", "Tablet"),
    ("Bilastine", "20mg", "Tablet"),
    ("Hydroxyzine (Atarax)", "10mg", "Tablet"),
    ("Hydroxyzine (Atarax)", "25mg", "Tablet"),
    ("Chlorpheniramine Maleate", "4mg", "Tablet"),
    ("Paracetamol + Phenylephrine + Chlorpheniramine (Sinarest)", "500mg/10mg/2mg", "Tablet"),
    ("Dextromethorphan + Chlorpheniramine (Alex / Grilinctus-DX)", "10mg/2mg per 5ml", "Syrup"),
    ("Ambroxol + Levosalbutamol + Guaifenesin (Ascoril-LS)", "30mg/1mg/50mg per 5ml", "Syrup"),
    ("Terbutaline + Bromhexine + Guaifenesin", "1.25mg/4mg/50mg per 5ml", "Syrup"),
    ("Acebrophylline", "100mg", "Capsule"),
    ("Acebrophylline SR", "200mg", "Tablet"),
    ("Doxofylline", "400mg", "Tablet"),
    ("Etofylline + Theophylline (Deriphyllin Retard)", "150mg", "Tablet"),
    ("Acetylcysteine Effervescent", "600mg", "Tablet"),
    ("Salbutamol (Asthalin)", "4mg", "Tablet"),
    ("Salbutamol Inhaler (Asthalin)", "100mcg", "Inhaler"),
    ("Levosalbutamol Respules (Levolin)", "0.63mg", "Respule"),
    ("Budesonide Respules (Budecort)", "0.5mg", "Respule"),
    ("Formoterol + Budesonide Inhaler (Foracort 200)", "6mcg/200mcg", "Inhaler"),
    ("Tiotropium Inhaler (Tiova)", "9mcg", "Inhaler"),
    ("Xylometazoline Nasal Drops (Otrivin)", "0.1% w/v", "Drops"),
    ("Saline Nasal Drops (Nasoclear)", "0.65% w/v", "Drops"),
    ("Fluticasone Furoate Nasal Spray", "27.5mcg", "Spray"),

    # Antidiabetics
    ("Metformin SR (Glycomet SR)", "500mg", "Tablet"),
    ("Metformin SR (Glycomet SR)", "1000mg", "Tablet"),
    ("Glimepiride (Amaryl)", "1mg", "Tablet"),
    ("Glimepiride (Amaryl)", "2mg", "Tablet"),
    ("Glimepiride + Metformin (Glycomet-GP 1)", "1mg/500mg", "Tablet"),
    ("Glimepiride + Metformin (Glycomet-GP 2)", "2mg/500mg", "Tablet"),
    ("Gliclazide XR", "60mg", "Tablet"),
    ("Sitagliptin", "50mg", "Tablet"),
    ("Sitagliptin", "100mg", "Tablet"),
    ("Sitagliptin + Metformin (Istamet)", "50mg/500mg", "Tablet"),
    ("Sitagliptin + Metformin (Istamet)", "50mg/1000mg", "Tablet"),
    ("Vildagliptin", "50mg", "Tablet"),
    ("Vildagliptin + Metformin (Galvus Met)", "50mg/500mg", "Tablet"),
    ("Teneligliptin", "20mg", "Tablet"),
    ("Teneligliptin + Metformin", "20mg/500mg", "Tablet"),
    ("Dapagliflozin", "10mg", "Tablet"),
    ("Dapagliflozin + Metformin", "10mg/500mg", "Tablet"),
    ("Empagliflozin (Jardiance)", "10mg", "Tablet"),
    ("Empagliflozin (Jardiance)", "25mg", "Tablet"),
    ("Voglibose", "0.2mg", "Tablet"),
    ("Voglibose", "0.3mg", "Tablet"),
    ("Pioglitazone", "15mg", "Tablet"),
    ("Insulin Human Mixtard 30/70", "40IU/ml", "Injection"),
    ("Insulin Glargine (Lantus)", "100IU/ml", "Injection"),
    ("Insulin Degludec + Aspart (Ryzodeg)", "100IU/ml", "Injection"),

    # Cardiovascular, Antihypertensives & Lipid-Lowering
    ("Amlodipine (Stamlo)", "5mg", "Tablet"),
    ("Amlodipine", "2.5mg", "Tablet"),
    ("Amlodipine", "10mg", "Tablet"),
    ("Cilnidipine (Cilacar)", "10mg", "Tablet"),
    ("Cilnidipine", "20mg", "Tablet"),
    ("Telmisartan (Telma)", "20mg", "Tablet"),
    ("Telmisartan (Telma)", "40mg", "Tablet"),
    ("Telmisartan", "80mg", "Tablet"),
    ("Telmisartan + Amlodipine (Telma-AM)", "40mg/5mg", "Tablet"),
    ("Telmisartan + Hydrochlorothiazide (Telma-H)", "40mg/12.5mg", "Tablet"),
    ("Telmisartan + Chlorthalidone (Telma-CT)", "40mg/12.5mg", "Tablet"),
    ("Losartan", "25mg", "Tablet"),
    ("Losartan", "50mg", "Tablet"),
    ("Losartan + Hydrochlorothiazide", "50mg/12.5mg", "Tablet"),
    ("Olmesartan", "20mg", "Tablet"),
    ("Olmesartan", "40mg", "Tablet"),
    ("Ramipril (Cardace)", "2.5mg", "Tablet"),
    ("Ramipril (Cardace)", "5mg", "Tablet"),
    ("Enalapril", "5mg", "Tablet"),
    ("Lisinopril", "5mg", "Tablet"),
    ("Lisinopril", "10mg", "Tablet"),
    ("Metoprolol Succinate XL (Met XL)", "25mg", "Tablet"),
    ("Metoprolol Succinate XL (Met XL)", "50mg", "Tablet"),
    ("Atenolol", "50mg", "Tablet"),
    ("Atenolol + Amlodipine", "50mg/5mg", "Tablet"),
    ("Nebivolol", "5mg", "Tablet"),
    ("Bisoprolol (Concor)", "2.5mg", "Tablet"),
    ("Bisoprolol (Concor)", "5mg", "Tablet"),
    ("Carvedilol", "3.125mg", "Tablet"),
    ("Carvedilol", "6.25mg", "Tablet"),
    ("Propranolol (Inderal / Ciplar)", "20mg", "Tablet"),
    ("Propranolol LA", "40mg", "Tablet"),
    ("Prazosin XL", "2.5mg", "Tablet"),
    ("Prazosin XL", "5mg", "Tablet"),
    ("Chlorthalidone", "6.25mg", "Tablet"),
    ("Chlorthalidone", "12.5mg", "Tablet"),
    ("Torsemide (Dytor)", "10mg", "Tablet"),
    ("Torsemide (Dytor)", "20mg", "Tablet"),
    ("Torsemide + Spironolactone (Dytor Plus)", "10mg/50mg", "Tablet"),
    ("Furosemide (Lasix)", "40mg", "Tablet"),
    ("Spironolactone (Aldactone)", "25mg", "Tablet"),
    ("Atorvastatin", "10mg", "Tablet"),
    ("Atorvastatin", "20mg", "Tablet"),
    ("Atorvastatin", "40mg", "Tablet"),
    ("Rosuvastatin", "5mg", "Tablet"),
    ("Rosuvastatin", "10mg", "Tablet"),
    ("Rosuvastatin", "20mg", "Tablet"),
    ("Rosuvastatin + Aspirin", "10mg/75mg", "Capsule"),
    ("Fenofibrate", "160mg", "Tablet"),
    ("Aspirin Enteric Coated (Ecosprin)", "75mg", "Tablet"),
    ("Aspirin Enteric Coated (Ecosprin)", "150mg", "Tablet"),
    ("Clopidogrel", "75mg", "Tablet"),
    ("Aspirin + Clopidogrel (Ecosprin-AV / Deplatt-A)", "75mg/75mg", "Capsule"),
    ("Nitroglycerin SR", "2.6mg", "Tablet"),
    ("Isosorbide Dinitrate (Sorbitrate)", "5mg", "Tablet"),

    # Vitamins, Minerals & Supplements
    ("Vitamin B-Complex + Vitamin C (Becosules)", "Standard", "Capsule"),
    ("Vitamin C Chewable (Limcee)", "500mg", "Tablet"),
    ("Cholecalciferol (Vitamin D3 - Uprise-D3)", "60000 IU", "Capsule"),
    ("Cholecalciferol Sachet", "60000 IU", "Sachet"),
    ("Calcium Carbonate + Vitamin D3 (Shelcal 500)", "500mg/250IU", "Tablet"),
    ("Calcium Citrate Malate + Vitamin D3", "250mg/200IU", "Tablet"),
    ("Methylcobalamin", "1500mcg", "Tablet"),
    ("Methylcobalamin + Alpha Lipoic Acid + Pyridoxine (Neurobion Forte)", "Standard", "Tablet"),
    ("Ferrous Ascorbate + Folic Acid (Orofer-XT)", "100mg/1.5mg", "Tablet"),
    ("Ferrous Ascorbate Syrup", "30mg/5ml", "Syrup"),
    ("Folic Acid (Folvite)", "5mg", "Tablet"),
    ("Zinc Acetate", "20mg", "Tablet"),
    ("Zinc Sulfate Oral Solution", "20mg/5ml", "Syrup"),
    ("Multivitamin + Multimineral (Zincovit)", "Standard", "Tablet"),
    ("Multivitamin Syrup (Zincovit)", "5ml", "Syrup"),
    ("Vitamin E (Evion)", "400mg", "Capsule"),
    ("Coenzyme Q10 + Lycopene", "100mg", "Capsule"),

    # Steroids, Thyroid, Urology, Gynecology, Neuro & Topicals
    ("Prednisolone (Wysolone)", "5mg", "Tablet"),
    ("Prednisolone (Wysolone)", "10mg", "Tablet"),
    ("Prednisolone (Wysolone)", "20mg", "Tablet"),
    ("Deflazacort", "6mg", "Tablet"),
    ("Methylprednisolone (Medrol)", "4mg", "Tablet"),
    ("Methylprednisolone (Medrol)", "8mg", "Tablet"),
    ("Dexamethasone", "0.5mg", "Tablet"),
    ("Levothyroxine Sodium (Thyronorm)", "25mcg", "Tablet"),
    ("Levothyroxine Sodium (Thyronorm)", "50mcg", "Tablet"),
    ("Levothyroxine Sodium (Thyronorm)", "75mcg", "Tablet"),
    ("Levothyroxine Sodium (Thyronorm)", "100mcg", "Tablet"),
    ("Carbimazole (Neomercazole)", "5mg", "Tablet"),
    ("Carbimazole (Neomercazole)", "10mg", "Tablet"),
    ("Pregabalin + Methylcobalamin", "75mg/750mcg", "Capsule"),
    ("Gabapentin + Nortriptyline", "300mg/10mg", "Tablet"),
    ("Amitriptyline", "10mg", "Tablet"),
    ("Amitriptyline", "25mg", "Tablet"),
    ("Escitalopram (Nexito)", "5mg", "Tablet"),
    ("Escitalopram (Nexito)", "10mg", "Tablet"),
    ("Clonazepam", "0.25mg", "Tablet"),
    ("Clonazepam", "0.5mg", "Tablet"),
    ("Alprazolam", "0.25mg", "Tablet"),
    ("Alprazolam", "0.5mg", "Tablet"),
    ("Betahistine (Vertin)", "8mg", "Tablet"),
    ("Betahistine (Vertin)", "16mg", "Tablet"),
    ("Cinnarizine (Stugeron)", "25mg", "Tablet"),
    ("Prochlorperazine (Stemetil MD)", "5mg", "Tablet"),
    ("Sumatriptan", "50mg", "Tablet"),
    ("Tamsulosin (Urimax)", "0.4mg", "Capsule"),
    ("Tamsulosin + Dutasteride (Urimax-D)", "0.4mg/0.5mg", "Capsule"),
    ("Silodosin", "8mg", "Capsule"),
    ("Disodium Hydrogen Citrate (Alkasol)", "1.4g/5ml", "Syrup"),
    ("Potassium Magnesium Citrate", "978mg", "Syrup"),
    ("Tranexamic Acid (Trapic)", "500mg", "Tablet"),
    ("Tranexamic Acid + Mefenamic Acid (Trapic-MF)", "500mg/250mg", "Tablet"),
    ("Norethisterone (Primolut-N)", "5mg", "Tablet"),
    ("Allopurinol (Zyloric)", "100mg", "Tablet"),
    ("Febuxostat (Febuget)", "40mg", "Tablet"),
    ("Febuxostat (Febuget)", "80mg", "Tablet"),
    ("Hydroxychloroquine (HCQS)", "200mg", "Tablet"),
    ("Moxifloxacin Eye Drops", "0.5% w/v", "Drops"),
    ("Carboxymethylcellulose Eye Drops (Refresh Tears)", "0.5% w/v", "Drops"),
    ("Ciprofloxacin Eye/Ear Drops (Ciplox)", "0.3% w/v", "Drops"),
    ("Clotrimazole + Lignocaine Ear Drops (Candid)", "1% w/v", "Drops"),
    ("Povidone Iodine Ointment (Betadine)", "5% w/w", "Ointment"),
    ("Mupirocin Ointment (T-Bact)", "2% w/w", "Ointment"),
    ("Fusidic Acid Cream (Fucidin)", "2% w/w", "Cream"),
    ("Clotrimazole Cream (Candid)", "1% w/w", "Cream"),
    ("Luliconazole Cream", "1% w/w", "Cream"),
    ("Betamethasone Valerate Cream (Betnovate)", "0.1% w/w", "Cream"),
    ("Mometasone Furoate Cream", "0.1% w/w", "Cream"),
    ("Calamine Lotion (Lacto Calamine)", "100ml", "Lotion"),
    ("Permethrin Cream", "5% w/w", "Cream"),
    ("Chlorhexidine Gluconate Mouthwash (Hexidine)", "0.2% w/v", "Mouthwash"),
    ("Choline Salicylate + Lignocaine Oral Gel (Zytee)", "10g", "Gel"),
]


def ensure_prescription_columns():
    """Safely migrate existing SQLite prescriptions table if new columns are missing."""
    inspector = inspect(engine)
    if not inspector.has_table("prescriptions"):
        return

    existing_cols = {col["name"] for col in inspector.get_columns("prescriptions")}
    migrations = [
        ("morning", "ALTER TABLE prescriptions ADD COLUMN morning BOOLEAN NOT NULL DEFAULT 0"),
        ("noon", "ALTER TABLE prescriptions ADD COLUMN noon BOOLEAN NOT NULL DEFAULT 0"),
        ("night", "ALTER TABLE prescriptions ADD COLUMN night BOOLEAN NOT NULL DEFAULT 0"),
        ("food_timing", "ALTER TABLE prescriptions ADD COLUMN food_timing VARCHAR(20) DEFAULT 'after'"),
        ("duration_days", "ALTER TABLE prescriptions ADD COLUMN duration_days INTEGER"),
    ]
    with engine.begin() as conn:
        for col_name, ddl in migrations:
            if col_name not in existing_cols:
                conn.execute(text(ddl))


def seed_medicines(db):
    """Idempotently seed the Medicine table with ~250 Indian clinic medicines."""
    existing = {
        (m.name.strip().lower(), (m.strength or "").strip().lower())
        for m in db.query(Medicine).all()
    }
    to_add = []
    for name, strength, form in INDIAN_CLINIC_MEDICINES:
        key = (name.strip().lower(), (strength or "").strip().lower())
        if key not in existing:
            existing.add(key)
            to_add.append(Medicine(name=name, strength=strength, form=form))
    if to_add:
        db.add_all(to_add)
        db.commit()
    return len(to_add)


def seed_clinic_settings(db):
    """Idempotently seed default ClinicSettings."""
    clinic = db.query(ClinicSettings).first()
    if not clinic:
        clinic = ClinicSettings(**DEFAULT_CLINIC_SETTINGS)
        db.add(clinic)
        db.commit()


def init_and_seed_db():
    """Run safe migration, create tables, and seed medicines + clinic settings."""
    ensure_prescription_columns()
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_medicines(db)
        seed_clinic_settings(db)
    finally:
        db.close()


if __name__ == "__main__":
    init_and_seed_db()
    db = SessionLocal()
    try:
        count = db.query(Medicine).count()
        print(f"Seeded successfully. Total medicines in DB: {count}")
    finally:
        db.close()
