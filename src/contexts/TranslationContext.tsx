import React, { createContext, useContext, ReactNode } from 'react';
import { usePreferences } from './UserPreferencesContext';

type TranslationKey =
  | 'overview' | 'local_updates' | 'risk_forecast' | 'asean_status' | 'global_alerts'
  | 'survival_guide' | 'details' | 'home' | 'map' | 'contacts' | 'profile'
  | 'alerts' | 'sign_out' | 'your_location' | 'edit_location' | 'share_location'
  | 'current_status' | 'get_evacuation_guide' | 'unread_alerts' | 'active_zones'
  | 'shelters' | 'nearest_emergency' | 'language' | 'settings' | 'view_full_map'
  | 'active_disasters' | 'people_affected' | 'recent_events' | 'disaster_map'
  | 'related_news' | 'breaking' | 'stable' | 'caution' | 'critical'
  | 'near_evacuation' | 'caution_zone' | 'danger_zone' | 'go_back'
  | 'country_not_found' | 'save' | 'cancel' | 'search_location'
  | 'guide_not_found' | 'guide_step' | 'guide_steps' | 'guide_remember'
  | 'guide_share_note'
  | 'emergency_contacts' | 'detecting_location' | 'showing_contacts_for'
  | 'sos_emergency' | 'search_contacts' | 'all' | 'loading_contacts'
  | 'away' | 'no_contacts_found' | 'sar_team' | 'ambulance_cat'
  | 'police_cat' | 'hospital_cat';

const translations: Record<string, Record<TranslationKey, string>> = {
  English: {
    overview: 'Overview', local_updates: 'Local Updates', risk_forecast: 'Risk Forecast',
    asean_status: 'ASEAN Status', global_alerts: 'Global Alerts', survival_guide: 'Quick Survival Guide',
    details: 'Details', home: 'Home', map: 'Map', contacts: 'Contacts', profile: 'Profile',
    alerts: 'Alerts', sign_out: 'Sign Out', your_location: 'Your Location',
    edit_location: 'Edit Location', share_location: 'Share Location',
    current_status: 'Your Current Status', get_evacuation_guide: 'Get Evacuation Guide',
    unread_alerts: 'Unread Alerts', active_zones: 'Active Zones', shelters: 'Shelters',
    nearest_emergency: 'Nearest Emergency', language: 'Language', settings: 'Settings',
    view_full_map: 'View Full Map', active_disasters: 'Active Disasters',
    people_affected: 'People Affected', recent_events: 'Recent Events',
    disaster_map: 'Disaster Map', related_news: 'Related News', breaking: 'BREAKING',
    stable: 'Stable', caution: 'Caution', critical: 'Critical',
    near_evacuation: 'Near Evacuation Point', caution_zone: 'Caution Zone',
    danger_zone: 'Danger Zone', go_back: 'Go Back', country_not_found: 'Country not found',
    save: 'Save', cancel: 'Cancel', search_location: 'Search location...',
    guide_not_found: 'Guide not found', guide_step: 'Step', guide_steps: 'Steps',
    guide_remember: 'Remember',
    guide_share_note: 'Share this guide with family and neighbors so everyone knows what to do before an emergency.',
    emergency_contacts: 'Emergency Contacts', detecting_location: 'Detecting location…',
    showing_contacts_for: 'Showing contacts for', sos_emergency: 'SOS — EMERGENCY',
    search_contacts: 'Search contacts...', all: 'All', loading_contacts: 'Loading emergency contacts…',
    away: 'away', no_contacts_found: 'No contacts found for', sar_team: 'SAR Team',
    ambulance_cat: 'Ambulance', police_cat: 'Police', hospital_cat: 'Hospital',
  },
  'Bahasa Indonesia': {
    overview: 'Ringkasan', local_updates: 'Berita Lokal', risk_forecast: 'Prakiraan Risiko',
    asean_status: 'Status ASEAN', global_alerts: 'Peringatan Global', survival_guide: 'Panduan Darurat',
    details: 'Detail', home: 'Beranda', map: 'Peta', contacts: 'Kontak', profile: 'Profil',
    alerts: 'Peringatan', sign_out: 'Keluar', your_location: 'Lokasi Anda',
    edit_location: 'Ubah Lokasi', share_location: 'Bagikan Lokasi',
    current_status: 'Status Anda Saat Ini', get_evacuation_guide: 'Panduan Evakuasi',
    unread_alerts: 'Belum Dibaca', active_zones: 'Zona Aktif', shelters: 'Tempat Evakuasi',
    nearest_emergency: 'Darurat Terdekat', language: 'Bahasa', settings: 'Pengaturan',
    view_full_map: 'Lihat Peta Lengkap', active_disasters: 'Bencana Aktif',
    people_affected: 'Orang Terdampak', recent_events: 'Kejadian Terkini',
    disaster_map: 'Peta Bencana', related_news: 'Berita Terkait', breaking: 'TERKINI',
    stable: 'Aman', caution: 'Waspada', critical: 'Kritis',
    near_evacuation: 'Dekat Titik Evakuasi', caution_zone: 'Zona Waspada',
    danger_zone: 'Zona Bahaya', go_back: 'Kembali', country_not_found: 'Negara tidak ditemukan',
    save: 'Simpan', cancel: 'Batal', search_location: 'Cari lokasi...',
    guide_not_found: 'Panduan tidak ditemukan', guide_step: 'Langkah', guide_steps: 'Langkah',
    guide_remember: 'Ingat',
    guide_share_note: 'Bagikan panduan ini kepada keluarga dan tetangga agar semua orang tahu apa yang harus dilakukan sebelum keadaan darurat.',
    emergency_contacts: 'Kontak Darurat', detecting_location: 'Mendeteksi lokasi…',
    showing_contacts_for: 'Menampilkan kontak untuk', sos_emergency: 'SOS — DARURAT',
    search_contacts: 'Cari kontak...', all: 'Semua', loading_contacts: 'Memuat kontak darurat…',
    away: 'jarak', no_contacts_found: 'Tidak ada kontak ditemukan untuk', sar_team: 'Tim SAR',
    ambulance_cat: 'Ambulans', police_cat: 'Polisi', hospital_cat: 'Rumah Sakit',
  },
  Filipino: {
    overview: 'Pangkalahatang-ideya', local_updates: 'Lokal na Balita', risk_forecast: 'Pagtataya ng Panganib',
    asean_status: 'Status ng ASEAN', global_alerts: 'Pandaigdigang Alerto', survival_guide: 'Gabay sa Kaligtasan',
    details: 'Detalye', home: 'Tahanan', map: 'Mapa', contacts: 'Kontak', profile: 'Profile',
    alerts: 'Mga Alerto', sign_out: 'Mag-sign out', your_location: 'Iyong Lokasyon',
    edit_location: 'I-edit ang Lokasyon', share_location: 'Ibahagi ang Lokasyon',
    current_status: 'Kasalukuyang Kalagayan', get_evacuation_guide: 'Gabay sa Paglikas',
    unread_alerts: 'Hindi pa Nabasa', active_zones: 'Aktibong Zona', shelters: 'Evacuation Center',
    nearest_emergency: 'Pinakamalapit na Emergency', language: 'Wika', settings: 'Settings',
    view_full_map: 'Tingnan ang Buong Mapa', active_disasters: 'Aktibong Kalamidad',
    people_affected: 'Apektadong Tao', recent_events: 'Kamakailang Pangyayari',
    disaster_map: 'Mapa ng Kalamidad', related_news: 'Kaugnay na Balita', breaking: 'BALITA',
    stable: 'Stable', caution: 'Babala', critical: 'Kritikal',
    near_evacuation: 'Malapit sa Evacuation', caution_zone: 'Zona ng Babala',
    danger_zone: 'Zona ng Panganib', go_back: 'Bumalik', country_not_found: 'Hindi nahanap ang bansa',
    save: 'I-save', cancel: 'Kanselahin', search_location: 'Maghanap ng lokasyon...',
    guide_not_found: 'Hindi nakita ang gabay', guide_step: 'Hakbang', guide_steps: 'Mga Hakbang',
    guide_remember: 'Tandaan',
    guide_share_note: 'Ibahagi ang gabay na ito sa pamilya at mga kapitbahay para alam ng lahat ang gagawin bago ang emergency.',
    emergency_contacts: 'Mga Pang-emergency na Kontak', detecting_location: 'Tinutukoy ang lokasyon…',
    showing_contacts_for: 'Ipinapakita ang mga kontak para sa', sos_emergency: 'SOS — EMERGENCY',
    search_contacts: 'Maghanap ng kontak...', all: 'Lahat', loading_contacts: 'Kinakarga ang mga kontak…',
    away: 'ang layo', no_contacts_found: 'Walang nahanap na kontak para sa', sar_team: 'SAR Team',
    ambulance_cat: 'Ambulansya', police_cat: 'Pulis', hospital_cat: 'Ospital',
  },
  'ภาษาไทย': {
    overview: 'ภาพรวม', local_updates: 'ข่าวท้องถิ่น', risk_forecast: 'การพยากรณ์ความเสี่ยง',
    asean_status: 'สถานะอาเซียน', global_alerts: 'การแจ้งเตือนทั่วโลก', survival_guide: 'คู่มือเอาตัวรอด',
    details: 'รายละเอียด', home: 'หน้าแรก', map: 'แผนที่', contacts: 'ผู้ติดต่อ', profile: 'โปรไฟล์',
    alerts: 'การแจ้งเตือน', sign_out: 'ออกจากระบบ', your_location: 'ตำแหน่งของคุณ',
    edit_location: 'แก้ไขตำแหน่ง', share_location: 'แชร์ตำแหน่ง',
    current_status: 'สถานะปัจจุบัน', get_evacuation_guide: 'คู่มืออพยพ',
    unread_alerts: 'ยังไม่ได้อ่าน', active_zones: 'โซนที่ใช้งาน', shelters: 'ที่พักพิง',
    nearest_emergency: 'ฉุกเฉินที่ใกล้ที่สุด', language: 'ภาษา', settings: 'การตั้งค่า',
    view_full_map: 'ดูแผนที่เต็ม', active_disasters: 'ภัยพิบัติที่ดำเนินอยู่',
    people_affected: 'ผู้ได้รับผลกระทบ', recent_events: 'เหตุการณ์ล่าสุด',
    disaster_map: 'แผนที่ภัยพิบัติ', related_news: 'ข่าวที่เกี่ยวข้อง', breaking: 'ด่วน',
    stable: 'ปลอดภัย', caution: 'ระวัง', critical: 'วิกฤต',
    near_evacuation: 'ใกล้จุดอพยพ', caution_zone: 'เขตเฝ้าระวัง',
    danger_zone: 'เขตอันตราย', go_back: 'กลับ', country_not_found: 'ไม่พบประเทศ',
    save: 'บันทึก', cancel: 'ยกเลิก', search_location: 'ค้นหาตำแหน่ง...',
    guide_not_found: 'ไม่พบคู่มือ', guide_step: 'ขั้นตอน', guide_steps: 'ขั้นตอน',
    guide_remember: 'จำไว้',
    guide_share_note: 'แชร์คู่มือนี้กับครอบครัวและเพื่อนบ้าน เพื่อให้ทุกคนรู้ว่าควรทำอย่างไรก่อนเกิดเหตุฉุกเฉิน',
    emergency_contacts: 'ข้อมูลติดต่อฉุกเฉิน', detecting_location: 'กำลังตรวจหาตำแหน่ง…',
    showing_contacts_for: 'แสดงข้อมูลติดต่อสำหรับ', sos_emergency: 'SOS — ฉุกเฉิน',
    search_contacts: 'ค้นหาผู้ติดต่อ...', all: 'ทั้งหมด', loading_contacts: 'กำลังโหลดข้อมูลติดต่อฉุกเฉิน…',
    away: 'ห่างออกไป', no_contacts_found: 'ไม่พบข้อมูลติดต่อสำหรับ', sar_team: 'ทีมค้นหาและกู้ภัย (SAR)',
    ambulance_cat: 'รถพยาบาล', police_cat: 'ตำรวจ', hospital_cat: 'โรงพยาบาล',
  },
  'Tiếng Việt': {
    overview: 'Tổng quan', local_updates: 'Tin địa phương', risk_forecast: 'Dự báo rủi ro',
    asean_status: 'Tình trạng ASEAN', global_alerts: 'Cảnh báo toàn cầu', survival_guide: 'Hướng dẫn sinh tồn',
    details: 'Chi tiết', home: 'Trang chủ', map: 'Bản đồ', contacts: 'Liên hệ', profile: 'Hồ sơ',
    alerts: 'Cảnh báo', sign_out: 'Đăng xuất', your_location: 'Vị trí của bạn',
    edit_location: 'Sửa vị trí', share_location: 'Chia sẻ vị trí',
    current_status: 'Trạng thái hiện tại', get_evacuation_guide: 'Hướng dẫn sơ tán',
    unread_alerts: 'Chưa đọc', active_zones: 'Vùng hoạt động', shelters: 'Nơi trú ẩn',
    nearest_emergency: 'Khẩn cấp gần nhất', language: 'Ngôn ngữ', settings: 'Cài đặt',
    view_full_map: 'Xem bản đồ đầy đủ', active_disasters: 'Thiên tai đang diễn ra',
    people_affected: 'Người bị ảnh hưởng', recent_events: 'Sự kiện gần đây',
    disaster_map: 'Bản đồ thiên tai', related_news: 'Tin liên quan', breaking: 'NÓNG',
    stable: 'Ổn định', caution: 'Cảnh giác', critical: 'Nghiêm trọng',
    near_evacuation: 'Gần điểm sơ tán', caution_zone: 'Vùng cảnh báo',
    danger_zone: 'Vùng nguy hiểm', go_back: 'Quay lại', country_not_found: 'Không tìm thấy quốc gia',
    save: 'Lưu', cancel: 'Hủy', search_location: 'Tìm vị trí...',
    guide_not_found: 'Không tìm thấy hướng dẫn', guide_step: 'Bước', guide_steps: 'Bước',
    guide_remember: 'Ghi nhớ',
    guide_share_note: 'Hãy chia sẻ hướng dẫn này với gia đình và hàng xóm để mọi người biết cần làm gì trước khi có tình huống khẩn cấp.',
    emergency_contacts: 'Liên hệ khẩn cấp', detecting_location: 'Đang xác định vị trí…',
    showing_contacts_for: 'Hiển thị liên hệ cho', sos_emergency: 'SOS — KHẨN CẤP',
    search_contacts: 'Tìm kiếm liên hệ...', all: 'Tất cả', loading_contacts: 'Đang tải liên hệ khẩn cấp…',
    away: 'cách đây', no_contacts_found: 'Không tìm thấy liên hệ nào cho', sar_team: 'Đội cứu hộ (SAR)',
    ambulance_cat: 'Xe cứu thương', police_cat: 'Cảnh sát', hospital_cat: 'Bệnh viện',
  },
  'Bahasa Melayu': {
    overview: 'Gambaran', local_updates: 'Berita Tempatan', risk_forecast: 'Ramalan Risiko',
    asean_status: 'Status ASEAN', global_alerts: 'Amaran Global', survival_guide: 'Panduan Keselamatan',
    details: 'Butiran', home: 'Utama', map: 'Peta', contacts: 'Hubungi', profile: 'Profil',
    alerts: 'Amaran', sign_out: 'Log Keluar', your_location: 'Lokasi Anda',
    edit_location: 'Edit Lokasi', share_location: 'Kongsi Lokasi',
    current_status: 'Status Semasa', get_evacuation_guide: 'Panduan Pemindahan',
    unread_alerts: 'Belum Dibaca', active_zones: 'Zon Aktif', shelters: 'Tempat Perlindungan',
    nearest_emergency: 'Kecemasan Terdekat', language: 'Bahasa', settings: 'Tetapan',
    view_full_map: 'Lihat Peta Penuh', active_disasters: 'Bencana Aktif',
    people_affected: 'Orang Terjejas', recent_events: 'Peristiwa Terkini',
    disaster_map: 'Peta Bencana', related_news: 'Berita Berkaitan', breaking: 'TERKINI',
    stable: 'Stabil', caution: 'Berhati-hati', critical: 'Kritikal',
    near_evacuation: 'Dekat Pusat Pemindahan', caution_zone: 'Zon Amaran',
    danger_zone: 'Zon Bahaya', go_back: 'Kembali', country_not_found: 'Negara tidak dijumpai',
    save: 'Simpan', cancel: 'Batal', search_location: 'Cari lokasi...',
    guide_not_found: 'Panduan tidak ditemui', guide_step: 'Langkah', guide_steps: 'Langkah',
    guide_remember: 'Ingat',
    guide_share_note: 'Kongsi panduan ini dengan keluarga dan jiran supaya semua orang tahu apa yang perlu dilakukan sebelum kecemasan.',
    emergency_contacts: 'Hubungan Kecemasan', detecting_location: 'Mengesan lokasi…',
    showing_contacts_for: 'Menunjukkan kenalan untuk', sos_emergency: 'SOS — KECEMASAN',
    search_contacts: 'Cari kenalan...', all: 'Semua', loading_contacts: 'Memuatkan kenalan kecemasan…',
    away: 'jauh', no_contacts_found: 'Tiada kenalan dijumpai untuk', sar_team: 'Pasukan SAR',
    ambulance_cat: 'Ambulans', police_cat: 'Polis', hospital_cat: 'Hospital',
  },
  'ភាសាខ្មែរ': {
    overview: 'ទិដ្ឋភាពទូទៅ', local_updates: 'ព័ត៌មានក្នុងស្រុក', risk_forecast: 'ការព្យាករណ៍ហានិភ័យ',
    asean_status: 'ស្ថានភាពអាស៊ាន', global_alerts: 'ការជូនដំណឹងសកល', survival_guide: 'មគ្គុទ្ទេសក៍រស់រានមានជីវិត',
    details: 'ព័ត៌មានលម្អិត', home: 'ទំព័រដើម', map: 'ផែនទី', contacts: 'ទំនាក់ទំនង', profile: 'ប្រវត្តិរូប',
    alerts: 'ការជូនដំណឹង', sign_out: 'ចាកចេញ', your_location: 'ទីតាំងរបស់អ្នក',
    edit_location: 'កែទីតាំង', share_location: 'ចែករំលែកទីតាំង',
    current_status: 'ស្ថានភាពបច្ចុប្បន្ន', get_evacuation_guide: 'មគ្គុទ្ទេសក៍ជម្លៀស',
    unread_alerts: 'មិនទាន់អាន', active_zones: 'តំបន់សកម្ម', shelters: 'ទីពាក់',
    nearest_emergency: 'បន្ទាន់ជិតបំផុត', language: 'ភាសា', settings: 'ការកំណត់',
    view_full_map: 'មើលផែនទីពេញ', active_disasters: 'គ្រោះមហន្តរាយសកម្ម',
    people_affected: 'មនុស្សរងផលប៉ះពាល់', recent_events: 'ព្រឹត្តិការណ៍ថ្មីៗ',
    disaster_map: 'ផែនទីគ្រោះមហន្តរាយ', related_news: 'ព័ត៌មានពាក់ព័ន្ធ', breaking: 'បន្ទាន់',
    stable: 'មានស្ថេរភាព', caution: 'ប្រុងប្រយ័ត្ន', critical: 'ធ្ងន់ធ្ងរ',
    near_evacuation: 'នៅជិតចំណុចជម្លៀស', caution_zone: 'តំបន់ប្រុងប្រយ័ត្ន',
    danger_zone: 'តំបន់គ្រោះថ្នាក់', go_back: 'ត្រឡប់ក្រោយ', country_not_found: 'រកប្រទេសមិនឃើញ',
    save: 'រក្សាទុក', cancel: 'បោះបង់', search_location: 'ស្វែងរកទីតាំង...',
    guide_not_found: 'រកមិនឃើញមគ្គុទ្ទេសក៍', guide_step: 'ជំហាន', guide_steps: 'ជំហាន',
    guide_remember: 'ចងចាំ',
    guide_share_note: 'សូមចែករំលែកមគ្គុទ្ទេសក៍នេះជាមួយគ្រួសារ និងអ្នកជិតខាង ដើម្បីឱ្យគ្រប់គ្នាដឹងថាត្រូវធ្វើអ្វីមុនពេលមានអាសន្ន។',
    emergency_contacts: 'ទំនាក់ទំនងបន្ទាន់', detecting_location: 'កំពុងស្វែងរកទីតាំង…',
    showing_contacts_for: 'បង្ហាញទំនាក់ទំនងសម្រាប់', sos_emergency: 'SOS — បន្ទាន់',
    search_contacts: 'ស្វែងរកទំនាក់ទំនង...', all: 'ទាំងអស់', loading_contacts: 'កំពុងទាញយកទំនាក់ទំនងបន្ទាន់…',
    away: 'ឆ្ងាយ', no_contacts_found: 'រកមិនឃើញទំនាក់ទំនងសម្រាប់', sar_team: 'ក្រុម SAR',
    ambulance_cat: 'ឡានពេទ្យ', police_cat: 'ប៉ូលីស', hospital_cat: 'មន្ទីរពេទ្យ',
  },
  'မြန်မာစာ': {
    overview: 'အကျဉ်းချုပ်', local_updates: 'ဒေသတွင်းသတင်းများ', risk_forecast: 'အန္တရာယ်ခန့်မှန်းချက်',
    asean_status: 'အာဆီယံအခြေအနေ', global_alerts: 'ကမ္ဘာလုံးဆိုင်ရာသတိပေးချက်များ', survival_guide: 'အသက်ရှင်သန်ရေးလမ်းညွှန်',
    details: 'အသေးစိတ်', home: 'ပင်မစာမျက်နှာ', map: 'မြေပုံ', contacts: 'အဆက်အသွယ်များ', profile: 'ကိုယ်ရေးအကျဉ်း',
    alerts: 'သတိပေးချက်များ', sign_out: 'အကောင့်ထွက်ရန်', your_location: 'သင့်တည်နေရာ',
    edit_location: 'တည်နေရာပြင်ရန်', share_location: 'တည်နေရာမျှဝေရန်',
    current_status: 'သင့်လက်ရှိအခြေအနေ', get_evacuation_guide: 'ဘေးလွတ်ရာရွှေ့ပြောင်းရေးလမ်းညွှန်',
    unread_alerts: 'မဖတ်ရသေးသောသတိပေးချက်များ', active_zones: 'လက်ရှိဇုန်များ', shelters: 'ခိုလှုံရာနေရာများ',
    nearest_emergency: 'အနီးဆုံးအရေးပေါ်အခြေအနေ', language: 'ဘာသာစကား', settings: 'ဆက်တင်များ',
    view_full_map: 'မြေပုံအပြည့်အစုံကြည့်ရန်', active_disasters: 'လက်ရှိဘေးအန္တရာယ်များ',
    people_affected: 'ထိခိုက်ခံရသူများ', recent_events: 'လတ်တလောဖြစ်ရပ်များ',
    disaster_map: 'ဘေးအန္တရာယ်မြေပုံ', related_news: 'ဆက်စပ်သတင်းများ', breaking: 'အထူးသတင်း',
    stable: 'တည်ငြိမ်သည်', caution: 'သတိပြုရန်', critical: 'စိုးရိမ်ရသည်',
    near_evacuation: 'ဘေးလွတ်ရာရွှေ့ပြောင်းမည့်နေရာအနီး', caution_zone: 'သတိပြုရန်ဇုန်',
    danger_zone: 'အန္တရာယ်ရှိသောဇုန်', go_back: 'နောက်သို့', country_not_found: 'နိုင်ငံရှာမတွေ့ပါ',
    save: 'သိမ်းဆည်းရန်', cancel: 'ပယ်ဖျက်ရန်', search_location: 'တည်နေရာရှာရန်...',
    emergency_contacts: 'အရေးပေါ်အဆက်အသွယ်များ', detecting_location: 'တည်နေရာရှာဖွေနေသည်…',
    showing_contacts_for: 'အဆက်အသွယ်များကိုပြသနေသည် - ', sos_emergency: 'SOS — အရေးပေါ်',
    search_contacts: 'အဆက်အသွယ်ရှာရန်...', all: 'အားလုံး', loading_contacts: 'အရေးပေါ်အဆက်အသွယ်များရယူနေပါသည်…',
    away: 'အကွာအဝေး', no_contacts_found: 'အဆက်အသွယ်ရှာမတွေ့ပါ - ', sar_team: 'ရှာဖွေကယ်ဆယ်ရေးအဖွဲ့',
    ambulance_cat: 'လူနာတင်ယာဉ်', police_cat: 'ရဲတပ်ဖွဲ့', hospital_cat: 'ဆေးရုံ',
    guide_not_found: 'လမ်းညွှန်ကို မတွေ့ပါ', guide_step: 'အဆင့်', guide_steps: 'အဆင့်များ',
    guide_remember: 'မှတ်ထားပါ',
    guide_share_note: 'အရေးပေါ်အခြေအနေမတိုင်မီ ဘာလုပ်ရမည်ကို လူတိုင်းသိစေရန် ဤလမ်းညွှန်ကို မိသားစုနှင့် အိမ်နီးချင်းများထံ မျှဝေပါ။',
  },
  'ພາສາລາວ': {
    overview: 'ພາບລວມ', local_updates: 'ຂ່າວທ້ອງຖິ່ນ', risk_forecast: 'ການຄາດຄະເນຄວາಮສ່ຽງ',
    asean_status: 'ສະຖານະອາຊຽນ', global_alerts: 'ການແຈ້ງເຕືອນທົ່ວໂລກ', survival_guide: 'ຄູ່ມືການລອດຊີວິດ',
    details: 'ລາຍລະອຽດ', home: 'ໜ້າຫຼັກ', map: 'ແຜນທີ່', contacts: 'ຕິດຕໍ່', profile: 'ໂປຣໄຟລ໌',
    alerts: 'ການແຈ້ງເຕືອນ', sign_out: 'ອອກຈາກລະບົບ', your_location: 'ທີ່ຢູ່ຂອງທ່ານ',
    edit_location: 'ແກ້ໄຂທີ່ຢູ່', share_location: 'ແບ່ງປັນທີ່ຢູ່',
    current_status: 'ສະຖານະປັດຈຸບັນ', get_evacuation_guide: 'ຄູ່ມືການຍົກຍ້າຍ',
    unread_alerts: 'ຍັງບໍ່ໄດ້ອ່ານ', active_zones: 'ເຂດທີ່ມີການເຄື່ອນໄຫວ', shelters: 'ບ່ອນລີ້ໄພ',
    nearest_emergency: 'ສຸກເສີນໃກ້ທີ່ສຸດ', language: 'ພາສາ', settings: 'ການຕັ້ງຄ່າ',
    view_full_map: 'ເບິ່ງແຜນທີ່ເຕັມ', active_disasters: 'ໄພພິບັດທີ່ກຳລັງເກີດ',
    people_affected: 'ຜູ້ໄດ້ຮັບຜົນກະທົບ', recent_events: 'ເຫດການຫຼ້າສຸດ',
    disaster_map: 'ແຜນທີ່ໄພພິບັດ', related_news: 'ຂ່າວທີ່ກ່ຽວຂ້ອງ', breaking: 'ດ่วน',
    stable: 'ໝັ້ນຄົງ', caution: 'ລະວັງ', critical: 'ວິກິດ',
    near_evacuation: 'ໃກ້ຈຸດຍົກຍ້າຍ', caution_zone: 'ເຂດລະວັງ',
    danger_zone: 'ເຂດອັນຕະລາຍ', go_back: 'ກັບຄືນ', country_not_found: 'ບໍ່ພົບປະເທດ',
    save: 'ບັນທຶກ', cancel: 'ຍົກເລີກ', search_location: 'ຊອກຫາທີ່ຢູ່...',
    guide_not_found: 'ບໍ່ພົບຄູ່ມື', guide_step: 'ຂັ້ນຕອນ', guide_steps: 'ຂັ້ນຕອນ',
    guide_remember: 'ຈື່ໄວ້',
    guide_share_note: 'ແບ່ງປັນຄູ່ມືນີ້ໃຫ້ຄອບຄົວ ແລະ ເພື່ອນບ້ານ ເພື່ອໃຫ້ທຸກຄົນຮູ້ວ່າຄວນເຮັດຫຍັງກ່ອນເກີດເຫດສຸກເສີນ',
    emergency_contacts: 'ການຕິດຕໍ່ສຸກເສີນ', detecting_location: 'ກຳລັງກວດຫາທີ່ຢູ່…',
    showing_contacts_for: 'ສະແດງການຕິດຕໍ່ສຳລັບ', sos_emergency: 'SOS — ສຸກເສີນ',
    search_contacts: 'ຄົ້ນຫາການຕິດຕໍ່...', all: 'ທັງໝົດ', loading_contacts: 'ກຳລັງໂຫຼດຂໍ້ມູນຕິດຕໍ່ສຸກເສີນ…',
    away: 'ຫ່າງອອກໄປ', no_contacts_found: 'ບໍ່ພົບການຕິດຕໍ່ສຳລັບ', sar_team: 'ທີມກູ້ໄພ SAR',
    ambulance_cat: 'ລົດໂຮງໝໍ', police_cat: 'ຕຳຫຼວດ', hospital_cat: 'ໂຮງໝໍ',
  },
};

// Map language setting names to translation keys
const languageMap: Record<string, string> = {
  'Indonesian': 'Bahasa Indonesia',
  'Filipino': 'Filipino',
  'Thai': 'ภาษาไทย',
  'Vietnamese': 'Tiếng Việt',
  'Malay': 'Bahasa Melayu',
  'English': 'English',
  'Burmese': 'မြန်မာစာ',
  'Khmer': 'ភាសាខ្មែរ',
  'Lao': 'ພາສາລາວ',
};

type TranslationContextType = {
  t: (key: TranslationKey) => string;
  currentLanguage: string;
};

const TranslationContext = createContext<TranslationContextType>({
  t: (key) => key,
  currentLanguage: 'English',
});

export const TranslationProvider = ({ children }: { children: React.ReactNode }) => {
  const { preferences } = usePreferences();
  const langKey = languageMap[preferences.language || 'English'] || 'English';

  const t = (key: TranslationKey) => {
    return translations[langKey]?.[key] || translations['English']?.[key] || key;
  };

  return (
    <TranslationContext.Provider value={{ t, currentLanguage: langKey }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => useContext(TranslationContext);
