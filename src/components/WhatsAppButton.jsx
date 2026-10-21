import React from "react";

const WhatsAppButton = () => {
  const whatsappLink = "https://wa.me/918826064806";
  const iconUrl = "https://img.icons8.com/color/96/000000/whatsapp.png"; // official WhatsApp PNG from Icons8
  return (
    <a
      href={whatsappLink}
      className="whatsapp-float animate-whatsapp"
      target="_blank"
      rel="noopener noreferrer"
    >
      <img src={iconUrl} alt="WhatsApp" className="whatsapp-icon" />
    </a>
  );
};

export default WhatsAppButton;
