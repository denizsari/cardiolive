import * as yup from 'yup';

// Common validation patterns
const phoneRegex = /^(\+90|0)?[0-9]{10}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

// User validation schemas
export const userValidationSchemas = {
  // Registration schema
  register: yup.object({
    name: yup
      .string()
      .required('Ad ve soyad zorunludur')
      .min(2, 'Ad en az 2 karakter olmalıdır')
      .max(50, 'Ad en fazla 50 karakter olmalıdır')
      .trim(),
    
    email: yup
      .string()
      .required('E-posta adresi zorunludur')
      .email('Geçerli bir e-posta adresi giriniz')
      .lowercase()
      .trim(),
    
    password: yup
      .string()
      .required('Şifre zorunludur')
      .min(8, 'Şifre en az 8 karakter olmalıdır')
      .matches(
        passwordRegex,
        'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir'
      ),
    
    confirmPassword: yup
      .string()
      .required('Şifre onayı zorunludur')
      .oneOf([yup.ref('password')], 'Şifreler eşleşmiyor'),
  }),

  // Login schema
  login: yup.object({
    email: yup
      .string()
      .required('E-posta adresi zorunludur')
      .email('Geçerli bir e-posta adresi giriniz')
      .lowercase()
      .trim(),
    
    password: yup
      .string()
      .required('Şifre zorunludur'),
  }),

  // Profile update schema
  updateProfile: yup.object({
    name: yup
      .string()
      .min(2, 'Ad en az 2 karakter olmalıdır')
      .max(50, 'Ad en fazla 50 karakter olmalıdır')
      .trim(),
    
    email: yup
      .string()
      .email('Geçerli bir e-posta adresi giriniz')
      .lowercase()
      .trim(),
    
    phoneNumber: yup
      .string()
      .matches(phoneRegex, 'Geçerli bir telefon numarası giriniz (örn: 05XXXXXXXXX)')
      .nullable(),
    
    address: yup
      .string()
      .max(200, 'Adres en fazla 200 karakter olmalıdır')
      .nullable(),
  }),

  // Change password schema
  changePassword: yup.object({
    currentPassword: yup
      .string()
      .required('Mevcut şifre zorunludur'),
    
    newPassword: yup
      .string()
      .required('Yeni şifre zorunludur')
      .min(8, 'Şifre en az 8 karakter olmalıdır')
      .matches(
        passwordRegex,
        'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir'
      ),
    
    confirmNewPassword: yup
      .string()
      .required('Yeni şifre onayı zorunludur')
      .oneOf([yup.ref('newPassword')], 'Şifreler eşleşmiyor'),
  }),
};

// Product validation schemas
export const productValidationSchemas = {
  // Create/Update product schema (admin)
  product: yup.object({
    name: yup
      .string()
      .required('Ürün adı zorunludur')
      .min(2, 'Ürün adı en az 2 karakter olmalıdır')
      .max(100, 'Ürün adı en fazla 100 karakter olmalıdır')
      .trim(),
    
    description: yup
      .string()
      .required('Ürün açıklaması zorunludur')
      .min(10, 'Ürün açıklaması en az 10 karakter olmalıdır')
      .max(1000, 'Ürün açıklaması en fazla 1000 karakter olmalıdır')
      .trim(),
    
    price: yup
      .number()
      .required('Ürün fiyatı zorunludur')
      .positive('Fiyat pozitif bir sayı olmalıdır')
      .max(99999.99, 'Fiyat çok yüksek'),
    
    category: yup
      .string()
      .required('Kategori zorunludur')
      .oneOf(
        ['Sızma Zeytinyağı', 'Naturel Zeytinyağı', 'Organik Zeytinyağı', 'Özel Seri'],
        'Geçerli bir kategori seçiniz'
      ),
    
    size: yup
      .string()
      .required('Ürün boyutu zorunludur')
      .oneOf(
        ['250ml', '500ml', '1L', '2L', '5L'],
        'Geçerli bir boyut seçiniz'
      ),
    
    stock: yup
      .number()
      .required('Stok miktarı zorunludur')
      .integer('Stok miktarı tam sayı olmalıdır')
      .min(0, 'Stok miktarı 0 veya pozitif olmalıdır')
      .max(9999, 'Stok miktarı çok yüksek'),
    
    images: yup
      .array()
      .of(yup.string().url('Geçerli bir URL giriniz'))
      .min(1, 'En az bir ürün görseli zorunludur')
      .required('Ürün görseli zorunludur'),
    
    featured: yup
      .boolean()
      .default(false),
    
    isActive: yup
      .boolean()
      .default(true),
  }),
};

// Order validation schemas
export const orderValidationSchemas = {
  // Shipping address schema
  shippingAddress: yup.object({
    fullName: yup
      .string()
      .required('Ad ve soyad zorunludur')
      .min(2, 'Ad en az 2 karakter olmalıdır')
      .max(50, 'Ad en fazla 50 karakter olmalıdır')
      .trim(),
    
    email: yup
      .string()
      .required('E-posta adresi zorunludur')
      .email('Geçerli bir e-posta adresi giriniz')
      .lowercase()
      .trim(),
    
    phone: yup
      .string()
      .required('Telefon numarası zorunludur')
      .matches(phoneRegex, 'Geçerli bir telefon numarası giriniz (örn: 05XXXXXXXXX)'),
    
    address: yup
      .string()
      .required('Adres zorunludur')
      .min(10, 'Adres en az 10 karakter olmalıdır')
      .max(200, 'Adres en fazla 200 karakter olmalıdır')
      .trim(),
    
    city: yup
      .string()
      .required('Şehir zorunludur')
      .min(2, 'Şehir en az 2 karakter olmalıdır')
      .max(50, 'Şehir en fazla 50 karakter olmalıdır')
      .trim(),
    
    district: yup
      .string()
      .required('İlçe zorunludur')
      .min(2, 'İlçe en az 2 karakter olmalıdır')
      .max(50, 'İlçe en fazla 50 karakter olmalıdır')
      .trim(),
    
    postalCode: yup
      .string()
      .required('Posta kodu zorunludur')
      .matches(/^[0-9]{5}$/, 'Posta kodu 5 haneli olmalıdır'),
    
    notes: yup
      .string()
      .max(500, 'Notlar en fazla 500 karakter olmalıdır')
      .nullable(),
  }),
};

// Review validation schemas
export const reviewValidationSchemas = {
  // Create/Update review schema
  review: yup.object({
    rating: yup
      .number()
      .required('Puan zorunludur')
      .integer('Puan tam sayı olmalıdır')
      .min(1, 'En az 1 puan verilmelidir')
      .max(5, 'En fazla 5 puan verilebilir'),
    
    title: yup
      .string()
      .max(100, 'Başlık en fazla 100 karakter olmalıdır')
      .trim()
      .nullable(),
    
    comment: yup
      .string()
      .required('Yorum zorunludur')
      .min(10, 'Yorum en az 10 karakter olmalıdır')
      .max(1000, 'Yorum en fazla 1000 karakter olmalıdır')
      .trim(),
  }),
};

// Contact form schema
export const contactValidationSchema = yup.object({
  name: yup
    .string()
    .required('Ad ve soyad zorunludur')
    .min(2, 'Ad en az 2 karakter olmalıdır')
    .max(50, 'Ad en fazla 50 karakter olmalıdır')
    .trim(),
  
  email: yup
    .string()
    .required('E-posta adresi zorunludur')
    .email('Geçerli bir e-posta adresi giriniz')
    .lowercase()
    .trim(),
  
  phone: yup
    .string()
    .matches(phoneRegex, 'Geçerli bir telefon numarası giriniz')
    .nullable(),
  
  subject: yup
    .string()
    .required('Konu zorunludur')
    .min(5, 'Konu en az 5 karakter olmalıdır')
    .max(100, 'Konu en fazla 100 karakter olmalıdır')
    .trim(),
  
  message: yup
    .string()
    .required('Mesaj zorunludur')
    .min(20, 'Mesaj en az 20 karakter olmalıdır')
    .max(1000, 'Mesaj en fazla 1000 karakter olmalıdır')
    .trim(),
});

// Blog validation schemas
export const blogValidationSchemas = {
  // Create/Update blog schema
  blog: yup.object({
    title: yup
      .string()
      .required('Blog başlığı zorunludur')
      .min(5, 'Başlık en az 5 karakter olmalıdır')
      .max(200, 'Başlık en fazla 200 karakter olmalıdır')
      .trim(),
    
    content: yup
      .string()
      .required('Blog içeriği zorunludur')
      .min(50, 'İçerik en az 50 karakter olmalıdır')
      .trim(),
    
    excerpt: yup
      .string()
      .max(500, 'Özet en fazla 500 karakter olmalıdır')
      .trim(),
    
    category: yup
      .string()
      .required('Kategori zorunludur')
      .trim(),
    
    tags: yup
      .array()
      .of(yup.string().trim())
      .max(10, 'En fazla 10 etiket eklenebilir'),
    
    featured: yup
      .boolean()
      .default(false),
    
    status: yup
      .string()
      .oneOf(['draft', 'published', 'archived'], 'Geçerli bir durum seçiniz')
      .default('draft'),
  }),
};

const validationSchemas = {
  user: userValidationSchemas,
  product: productValidationSchemas,
  order: orderValidationSchemas,
  review: reviewValidationSchemas,
  contact: contactValidationSchema,
  blog: blogValidationSchemas,
};

export default validationSchemas;
