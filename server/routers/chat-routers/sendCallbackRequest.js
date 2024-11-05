const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
const { addNotification } = require('../notifications/addNotification');

router.post('/send-call-back-request', async (req, res) => {
    const { buyerName, buyerEmail, buyerPhoneNumber, currentUserId, profile, sellerEmail, sellerUserId } = req.body;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'dilipatportfolio@gmail.com',
            pass: 'qonxbjlxmzbnkkhc',
        },
    });

    const newNotification = {
        title: `Contact Request from ${buyerName}`,
        senderName: buyerName,
        email: buyerEmail,
        phone: buyerPhoneNumber,
        profile: profile,
        desc: 'You have received a request to contact the buyer regarding your listing. Please find the buyer details below:',
        senderId: currentUserId,
        isRead: false,
        createDate: new Date(),
    };

    const mailOptions = {
        from: buyerEmail,
        to: sellerEmail,
        subject: `Contact Request from ${buyerName}`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                <h2 style="background-color: #007bff; color: white; padding: 15px; border-radius: 8px; text-align: center; font-size: 24px;">
                    Buyer Contact Request
                </h2>
                <p style="font-size: 16px;">Hello,</p>
                <p style="font-size: 16px;">You have received a request to contact the buyer regarding your listing. Please find the buyer's details below:</p>
                
                <div style="border: 1px solid #ddd; padding: 15px; margin: 20px 0; border-radius: 8px; background-color: #f9f9f9;">
                    <h3 style="font-size: 20px; margin-bottom: 10px; color: #007bff;">Buyer Details:</h3>
                    <p style="font-size: 16px;"><strong>Name:</strong> ${buyerName}</p>
                    <p style="font-size: 16px;"><strong>Email:</strong> ${buyerEmail}</p>
                    <p style="font-size: 16px;"><strong>Phone Number:</strong> ${buyerPhoneNumber}</p>
                </div>
    
                <p style="font-size: 16px;">Feel free to contact the buyer at your earliest convenience either by email or phone. The buyer is looking forward to hearing from you.</p>
    
                <div style="text-align: center; margin-top: 30px;">
                    <a href="mailto:${buyerEmail}" style="background-color: #28a745; color: white; padding: 15px 25px; text-decoration: none; font-size: 18px; font-weight: bold; border-radius: 8px; display: inline-block; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        Reply to Buyer
                    </a>
                </div>
    
                <p style="font-size: 14px; color: #777; margin-top: 30px; text-align: center;">
                    Thank you for using our service to connect with potential buyers. We hope this helps you find the right match for your listing.
                </p>
            </div>
        `,
    };


    try {
        // Send notification first
        const result = await addNotification(sellerUserId, newNotification);
        if (result.success) {
       
            res.status(200).json({ message: 'Callback request sent' });
           
            setImmediate(async () => {
                try {
                    const mailSent = await transporter.sendMail(mailOptions);
                    if (mailSent) {
                        console.log('Email sent successfully');
                    }
                } catch (error) {
                    console.error('Error sending email:', error);
                }
            });
        } else {
            res.status(500).json({ error: result.message });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error processing request', error });
    }


});

module.exports = router;
