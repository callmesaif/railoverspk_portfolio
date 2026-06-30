'use client';

export default function WhatsAppChat() {
  // Apna mobile number country code (92) ke sath likhein (bina '+' ya spaces ke)
  const phoneNumber = "923198550419"; 
  
  // Default message jo user ke pass pehle se likha hua aayega
  const defaultMessage = "Salam RaiLoversPK! Mujhe railway ke hawale se rehnumai chahiye.";
  const encodedMessage = encodeURIComponent(defaultMessage);

  return (
    <a
      href={`https://wa.me/${phoneNumber}?text=${encodedMessage}`}
      target="_blank"
      rel="noopener noreferrer"
      title="Chat on WhatsApp"
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        background: '#25D366',
        color: '#fff',
        borderRadius: '50%',
        width: '60px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        zIndex: 9999,
        fontSize: '32px',
        textDecoration: 'none',
        transition: 'transform 0.2s ease, background-color 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.background = '#20ba5a';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.background = '#25D366';
      }}
    >
      {/* Aap yahan icon bhi laga sakte hain, abhi ke liye emoji use kiya hai */}
      💬
    </a>
  );
}