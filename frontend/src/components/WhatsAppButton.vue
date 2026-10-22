<template>
  <a
    href="https://wa.me/18005550199?text=Hello%20NovaMarket%20Support,%20I%20have%20an%20enquiry%20regarding%20products."
    target="_blank"
    rel="noopener noreferrer"
    class="whatsapp-float"
    title="Chat with Customer Concierge on WhatsApp"
  >
    <div class="whatsapp-icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.541 1.761.82 2.791.82 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.587-5.806-5.768-5.806zm3.377 8.243c-.145.408-.838.775-1.163.824-.316.048-.737.075-2.285-.566-1.921-.796-3.136-2.753-3.23-2.879-.094-.126-.777-1.034-.777-1.972 0-.938.489-1.399.663-1.589.174-.19.38-.238.506-.238.127 0 .253.001.364.007.117.006.273-.044.428.328.158.38.539 1.314.586 1.41.047.095.079.206.016.332-.063.127-.095.206-.19.317-.095.111-.199.248-.284.333-.095.095-.195.198-.084.388.111.19.493.813 1.058 1.316.729.649 1.344.85 1.534.945.19.095.301.079.412-.047.111-.127.475-.554.602-.744.127-.19.253-.158.428-.095.174.063 1.109.523 1.3.618.19.095.317.143.364.222.048.079.048.459-.097.867z"/>
      </svg>
    </div>
    <span class="whatsapp-label">Concierge</span>
  </a>
</template>

<style scoped>
.whatsapp-float {
  position: fixed;
  bottom: 1.5rem;
  left: 1.5rem;
  z-index: 990;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #25d366;
  color: #ffffff;
  padding: 0.65rem 1.1rem;
  border-radius: 9999px;
  box-shadow: 0 4px 16px rgba(37, 211, 102, 0.4);
  font-weight: 700;
  font-size: 0.88rem;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.whatsapp-float:hover {
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 8px 24px rgba(37, 211, 102, 0.55);
}

.whatsapp-icon {
  display: flex;
  align-items: center;
}
</style>
