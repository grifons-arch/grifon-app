# Grifon Eshop

Συνοπτική καταγραφή των μέχρι τώρα εργασιών για το project **Grifon eShop**, με τα βασικά κομμάτια που έχουν ήδη υλοποιηθεί.

## Τι έχουμε υλοποιήσει μέχρι τώρα

- **Android εφαρμογή (module `app`)**
  - Βασική δομή client για περιήγηση στο e‑shop.
  - Σύνδεση με το gateway και ροή εγγραφής χρήστη.
  - Έκδοση εφαρμογής: **1.1.0**.
- **Backend proxy (`backend/`)**
  - REST API που μεσολαβεί στο PrestaShop Webservice.
  - Endpoints για κατηγορίες, προϊόντα, αναζήτηση και stock.
- **Gateway υπηρεσία (`grifon-gateway/`)**
  - Ασφαλές proxy για PrestaShop multishop.
  - Φιλτραρισμένα endpoints, έλεγχος τιμών ανά πελάτη και μηχανισμοί ασφάλειας.
- **Ροή εγγραφής**
  - Παράδειγμα `curl` για register.
  - Οδηγίες σύνδεσης του Android client με το gateway.

## Δομή αποθετηρίου

- `app/` — Android client (Gradle project).
- `backend/` — Node.js REST proxy για PrestaShop.
- `grifon-gateway/` — Node.js gateway με multishop υποστήριξη.

## Τεκμηρίωση

Για αναλυτικές οδηγίες εκκίνησης, ρυθμίσεις και endpoints, δείτε τα README στα επιμέρους directories:
- `backend/README.md`
- `grifon-gateway/README.md`

## Πώς να δοκιμάσεις

### Gateway (register)

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "passwd": "secret123",
    "firstName": "Γιώργος",
    "lastName": "Παπαδόπουλος",
    "countryIso": "GR",
    "street": "Πανεπιστημίου 1",
    "city": "Αθήνα",
    "postalCode": "10564",
    "phone": "+30 2100000000",
    "company": "Grifon SA",
    "vatNumber": "EL123456789",
    "iban": "GR1601101250000000012300695",
    "customerDataPrivacyAccepted": true,
    "termsAndPrivacyAccepted": true
  }'
```

### Android flow

1. Ρύθμισε το `API_BASE_URL` στο `app/build.gradle.kts` (π.χ. `http://10.0.2.2:3000/` για emulator) ώστε να δείχνει στο gateway και όχι στο PrestaShop `/api`. Για debug build, το default είναι ήδη `http://10.0.2.2:3000/` ή μπορείς να το κάνεις override με `-PAPI_BASE_URL_DEBUG=...`.
2. Εκκίνησε την εφαρμογή και πήγαινε στη φόρμα εγγραφής.
3. Συμπλήρωσε τα πεδία και πάτησε **Υποβολή αίτησης** ώστε να σταλεί το αίτημα στο gateway.

## Troubleshooting

### Android logcat: AppOps SecurityException (UID/package mismatch)

Αν δεις μηνύματα όπως:

```
Bad call made by uid 1001. Package "com.android.phone" does not belong to uid 10155.
AppOps ... java.lang.SecurityException: Specified package "com.android.phone" under uid 10155 but it is not
```

Αυτό σημαίνει ότι κάποια διεργασία έκανε κλήση AppOps για **διαφορετικό package name/uid** (συνήθως από system services ή Google Play services) και **δεν είναι σφάλμα της εφαρμογής**. Για επιβεβαίωση/αποφόρτιση:

- Βεβαιώσου ότι οι δικές μας κλήσεις (αν υπάρχουν) περνούν **το δικό μας package name** και το σωστό UID της εφαρμογής.
- Δοκίμασε ενημέρωση/εκκαθάριση δεδομένων του Google Play Services ή επανεκκίνηση του emulator/device.
- Αν το log εμφανίζεται χωρίς λειτουργικό πρόβλημα στην εφαρμογή, μπορεί να αγνοηθεί ως προειδοποίηση συστήματος.
