import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PopupModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Show popup after 3 seconds
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Close the popup if clicking on the background (backdrop)
  const handleBackdropClick = (e) => {
    if (e.target.id === "modal-backdrop") {
      setIsOpen(false);
    }
  };

  const handleImageClick = () => {
    setIsOpen(false);
    navigate("/daily-mains-writing");
  };

  if (!isOpen) return null;

  return (
    <div
      id="modal-backdrop"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-md sm:max-w-lg md:max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Close Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
          className="absolute top-3 right-3 z-10 p-2 bg-black/40 hover:bg-black/70 text-white rounded-full transition-all duration-300 backdrop-blur-md"
          aria-label="Close popup"
        >
          <X size={20} />
        </button>

        {/* Popup Image */}
        <img
          src="/images/newpopup2.jpeg"
          alt="Special Offer"
          className="w-full h-auto object-cover block cursor-pointer"
          onClick={handleImageClick}
        />
      </div>
    </div>
  );
};

export default PopupModal;
