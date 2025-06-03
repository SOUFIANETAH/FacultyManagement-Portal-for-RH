"use client";
import React, { useState, useEffect } from 'react';
import './Contact.css';

interface Location {
    id: number;
    name: string;
    address: string;
    phone: string;
    mapUrl: string;
    coords: string;
}

const Contact: React.FC = () => {
    const [currentLocationIndex, setCurrentLocationIndex] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    // Form state
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const locations: Location[] = [
        {
            id: 1,
            name: "Main Campus",
            address: "b p 11201, Avenue Zitoune, Meknes",
            phone: "05355-37321",
            mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3306.8!2d-5.5473!3d33.8935!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzPCsDUzJzM2LjYiTiA1wrAzMic1MC4zIlc!5e0!3m2!1sen!2sma!4v1234567890",
            coords: "33.8935,-5.5473"
        },
        {
            id: 2,
            name: "Secondary Campus",
            address: "الطريق الوطنية رقم 13, شارع بئر أنزران, Meknès",
            phone: "05355-37012",
            mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3307.2!2d-5.5407!3d33.8756!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzPCsDUyJzMyLjIiTiA1wrAzMic'26.1Ilc!5e0!3m2!1sen!2sma!4v1234567891",
            coords: "33.8756,-5.5407"
        }
    ];

    const currentLocation = locations[currentLocationIndex];

    const switchLocation = (index: number) => {
        setCurrentLocationIndex(index);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");
        setSuccess("");
        setSubmitStatus('idle');

        // Validation
        if (!name || !email || !subject || !message) {
            setError("Please fill in all fields.");
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch("/api/alerts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: `Contact: ${subject} - ${name}`,
                    description: `From: ${name} (${email})\nSubject: ${subject}\n\nMessage:\n${message}`,
                    type: "info",
                    userId: null, // Anonymous message
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to send message.");
            }

            setSuccess("Your message has been sent successfully. We will respond to you soon.");
            setSubmitStatus('success');

            // Clear form
            setName("");
            setEmail("");
            setSubject("");
            setMessage("");

            // Reset success status after 3 seconds
            setTimeout(() => {
                setSubmitStatus('idle');
                setSuccess("");
            }, 3000);

        } catch (err) {
            setError("An error occurred. Please try again later.");
            setSubmitStatus('error');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getDirectionsUrl = () => {
        return `https://www.google.com/maps/dir/?api=1&destination=${currentLocation.coords}`;
    };

    const getSubmitButtonContent = () => {
        if (isSubmitting) {
            return (
                <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Sending...
                </>
            );
        }
        if (submitStatus === 'success') {
            return (
                <>
                    <i className="fas fa-check"></i>
                    Message Sent!
                </>
            );
        }
        return (
            <>
                <i className="fas fa-paper-plane"></i>
                Send Message
            </>
        );
    };

    return (
        <div className="contact-page">
            <div className="bg-animation"></div>

            <div className="container">
                {/* Header */}
                <header className="header">
                    <h1>Contact Our Faculty</h1>
                    <p>Connect with us for academic excellence and support. We're here to guide your educational journey.</p>
                </header>

                {/* Main Content Grid */}
                <div className="main-grid">
                    {/* Contact Information */}
                    <div className="contact-section">
                        <h2 className="section-title">
                            <i className="fas fa-map-marker-alt"></i>
                            Our Campus Locations
                        </h2>

                        {locations.map((location, index) => (
                            <div
                                key={location.id}
                                className={`location-card ${currentLocationIndex === index ? 'active' : ''}`}
                                onClick={() => switchLocation(index)}
                            >
                                <h3 className="location-name">{location.name}</h3>
                                <div className="location-info">
                                    <i className="fas fa-map-marker-alt"></i>
                                    <span>{location.address}</span>
                                </div>
                                <div className="location-info">
                                    <i className="fas fa-phone"></i>
                                    <a href={`tel:${location.phone}`} className="phone-link">
                                        {location.phone}
                                    </a>
                                </div>
                            </div>
                        ))}

                        {/* Additional Info Cards */}
                        <div className="info-cards">
                            <div className="info-card">
                                <div className="info-card-header">
                                    <i className="fas fa-clock"></i>
                                    <h4 className="info-card-title">Office Hours</h4>
                                </div>
                                <div className="info-card-content">
                                    Monday - Friday: 8:00 AM - 6:00 PM<br />
                                    Saturday: 8:00 AM - 2:00 PM
                                </div>
                            </div>

                            <div className="info-card">
                                <div className="info-card-header">
                                    <i className="fas fa-envelope"></i>
                                    <h4 className="info-card-title">Email</h4>
                                </div>
                                <div className="info-card-content">
                                    <a href="mailto:contact@faculty.edu.ma" className="phone-link">
                                        contact@faculty.edu.ma
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Map Section */}
                    <div className="map-section">
                        <div className="map-header">
                            <h3 className="map-title">
                                <i className="fas fa-navigation"></i>
                                <span>{currentLocation.name}</span>
                            </h3>
                            <p className="map-address">{currentLocation.address}</p>
                        </div>

                        <div className="map-container">
                            <iframe
                                src={currentLocation.mapUrl}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title={`Map of ${currentLocation.name}`}
                            />
                        </div>

                        <div className="map-footer">
                            <div className="map-phone">
                                <i className="fas fa-phone"></i>
                                <span>{currentLocation.phone}</span>
                            </div>
                            <a
                                href={getDirectionsUrl()}
                                className="directions-btn"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <i className="fas fa-navigation"></i>
                                Get Directions
                            </a>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="contact-form">
                    <h3 className="form-title">Send us a Message</h3>

                    {/* Error and Success Messages */}
                    {error && (
                        <div className="alert alert-error">
                            <i className="fas fa-exclamation-circle"></i>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="alert alert-success">
                            <i className="fas fa-check-circle"></i>
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Your full name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="your.email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Subject</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="What is this regarding?"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Message</label>
                            <textarea
                                className="form-textarea"
                                placeholder="Your message here..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className={`submit-btn ${submitStatus}`}
                            disabled={isSubmitting}
                        >
                            {getSubmitButtonContent()}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;