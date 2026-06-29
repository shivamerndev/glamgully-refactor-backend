import twilio from 'twilio';


// Twilio Client
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// WhatsApp notification function
const sendAdminWhatsApp = async (orderId, amount) => {
    try {
        await client.messages.create({
            from: process.env.TWILIO_WHATSAPP_NUMBER, // Twilio Sandbox number
            body: `✅ New payment received!\nOrder ID: ${orderId}\nAmount: ₹${amount / 100}`,
            // contentSid: 'HX350d429d32e64a552466cafecbe95f3c', // Tumhara template SID
            // contentVariables: JSON.stringify({
            //     "1": orderId,            // Template ka {1}
            //     "2": `₹${amount / 100}`, // Template ka {2}
            //     "3": address
            // }),
            to: process.env.ADMIN_WHATSAPP // Admin ka WhatsApp number (sandbox join kiya ho)
        });
        console.log("✅ WhatsApp notification sent to admin");
    } catch (err) {
        console.error("❌ Failed to send WhatsApp:", err);
    }
};