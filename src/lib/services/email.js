import nodemailer from 'nodemailer';

// Create transporter using SMTP configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Email templates
const emailTemplates = {
  // User confirmation email
  userConfirmation: (bookingData) => ({
    subject: `Booking Confirmation - ${bookingData.bookingReference}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #10b981; color: white; padding: 20px; text-align: center;">
          <h1>Booking Confirmation</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f9fafb;">
          <h2>Hello ${bookingData.patient.firstName} ${bookingData.patient.lastName},</h2>
          
          <p>Your physiotherapy appointment has been successfully booked!</p>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Appointment Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Booking Reference:</strong> ${bookingData.bookingReference}</li>
              <li><strong>Date:</strong> ${new Date(bookingData.appointmentDate).toLocaleDateString()}</li>
              <li><strong>Time:</strong> ${bookingData.appointmentTime}</li>
              <li><strong>Duration:</strong> ${bookingData.durationMinutes} minutes</li>
              <li><strong>Therapist:</strong> ${bookingData.physiotherapist.name}</li>
              <li><strong>Clinic:</strong> ${bookingData.clinic.name}</li>
              <li><strong>Address:</strong> ${bookingData.clinic.addressLine1}, ${bookingData.clinic.city.name}</li>
              ${bookingData.treatmentType ? `<li><strong>Treatment:</strong> ${bookingData.treatmentType}</li>` : ''}
              <li><strong>Total Amount:</strong> €${bookingData.totalAmount}</li>
            </ul>
          </div>
          
          <p><strong>Status:</strong> <span style="color: #f59e0b;">Pending Confirmation</span></p>
          
          <p>Your therapist will review and confirm this booking. You'll receive another email once it's confirmed.</p>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4>Important Notes:</h4>
            <ul>
              <li>Please arrive 10 minutes before your appointment time</li>
              <li>Bring any relevant medical documents or referrals</li>
              <li>Wear comfortable clothing suitable for physiotherapy</li>
            </ul>
          </div>
          
          <p>If you need to make any changes to your booking, please contact us as soon as possible.</p>
          
          <p>Thank you for choosing our physiotherapy services!</p>
          
          <p>Best regards,<br>The Abaile Team</p>
        </div>
      </div>
    `
  }),

  // Therapist notification email
  therapistNotification: (bookingData) => ({
    subject: `New Booking Request - ${bookingData.bookingReference}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #3b82f6; color: white; padding: 20px; text-align: center;">
          <h1>New Booking Request</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f9fafb;">
          <h2>Hello ${bookingData.physiotherapist.name},</h2>
          
          <p>You have received a new booking request that requires your attention.</p>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Booking Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Booking Reference:</strong> ${bookingData.bookingReference}</li>
              <li><strong>Patient:</strong> ${bookingData.patient.firstName} ${bookingData.patient.lastName}</li>
              <li><strong>Patient Email:</strong> ${bookingData.patient.email}</li>
              <li><strong>Patient Phone:</strong> ${bookingData.patient.phone || 'Not provided'}</li>
              <li><strong>Date:</strong> ${new Date(bookingData.appointmentDate).toLocaleDateString()}</li>
              <li><strong>Time:</strong> ${bookingData.appointmentTime}</li>
              <li><strong>Duration:</strong> ${bookingData.durationMinutes} minutes</li>
              <li><strong>Clinic:</strong> ${bookingData.clinic.name}</li>
              <li><strong>Address:</strong> ${bookingData.clinic.addressLine1}, ${bookingData.clinic.city.name}</li>
              ${bookingData.treatmentType ? `<li><strong>Treatment:</strong> ${bookingData.treatmentType}</li>` : ''}
              <li><strong>Total Amount:</strong> €${bookingData.totalAmount}</li>
            </ul>
          </div>
          
          ${bookingData.patientNotes ? `
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4>Patient Notes:</h4>
              <p>${bookingData.patientNotes}</p>
            </div>
          ` : ''}
          
          <p><strong>Action Required:</strong> Please review and confirm or reject this booking through your dashboard.</p>
          
          <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4>Next Steps:</h4>
            <ol>
              <li>Review the booking details</li>
              <li>Check your availability for the requested time</li>
              <li>Confirm or reject the booking</li>
              <li>If confirmed, prepare for the session</li>
            </ol>
          </div>
          
          <p>Thank you for your prompt attention to this matter.</p>
          
          <p>Best regards,<br>The Abaile Team</p>
        </div>
      </div>
    `
  }),

  // Admin notification email
  adminNotification: (bookingData) => ({
    subject: `New Booking Created - ${bookingData.bookingReference}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #6b7280; color: white; padding: 20px; text-align: center;">
          <h1>New Booking Created</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f9fafb;">
          <h2>Admin Notification</h2>
          
          <p>A new booking has been created in the system.</p>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Booking Summary:</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Booking Reference:</strong> ${bookingData.bookingReference}</li>
              <li><strong>Patient:</strong> ${bookingData.patient.firstName} ${bookingData.patient.lastName} (${bookingData.patient.email})</li>
              <li><strong>Therapist:</strong> ${bookingData.physiotherapist.name} (${bookingData.physiotherapist.email})</li>
              <li><strong>Date & Time:</strong> ${new Date(bookingData.appointmentDate).toLocaleDateString()} at ${bookingData.appointmentTime}</li>
              <li><strong>Clinic:</strong> ${bookingData.clinic.name}</li>
              <li><strong>Amount:</strong> €${bookingData.totalAmount}</li>
              <li><strong>Status:</strong> Pending Confirmation</li>
            </ul>
          </div>
          
          <p>This booking is currently pending therapist confirmation.</p>
          
          <p>Best regards,<br>The Abaile System</p>
        </div>
      </div>
    `
  }),

  // Booking cancellation email
  bookingCancellation: (bookingData, cancelledBy) => ({
    subject: `Booking Cancelled - ${bookingData.bookingReference}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #ef4444; color: white; padding: 20px; text-align: center;">
          <h1>Booking Cancelled</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f9fafb;">
          <h2>Booking Cancellation Notice</h2>
          
          <p>The following booking has been cancelled by ${cancelledBy}:</p>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Cancelled Booking Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Booking Reference:</strong> ${bookingData.bookingReference}</li>
              <li><strong>Patient:</strong> ${bookingData.patient.firstName} ${bookingData.patient.lastName}</li>
              <li><strong>Therapist:</strong> ${bookingData.physiotherapist.name}</li>
              <li><strong>Date:</strong> ${new Date(bookingData.appointmentDate).toLocaleDateString()}</li>
              <li><strong>Time:</strong> ${bookingData.appointmentTime}</li>
              <li><strong>Clinic:</strong> ${bookingData.clinic.name}</li>
            </ul>
          </div>
          
          <p>If you have any questions about this cancellation, please contact our support team.</p>
          
          <p>Best regards,<br>The Abaile Team</p>
        </div>
      </div>
    `
  }),

  // Booking confirmation email
  bookingConfirmation: (bookingData) => ({
    subject: `Booking Confirmed - ${bookingData.bookingReference}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #10b981; color: white; padding: 20px; text-align: center;">
          <h1>Booking Confirmed</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f9fafb;">
          <h2>Hello ${bookingData.patient.firstName} ${bookingData.patient.lastName},</h2>
          
          <p>Great news! Your physiotherapy appointment has been confirmed by your therapist.</p>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Confirmed Appointment:</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Booking Reference:</strong> ${bookingData.bookingReference}</li>
              <li><strong>Date:</strong> ${new Date(bookingData.appointmentDate).toLocaleDateString()}</li>
              <li><strong>Time:</strong> ${bookingData.appointmentTime}</li>
              <li><strong>Duration:</strong> ${bookingData.durationMinutes} minutes</li>
              <li><strong>Therapist:</strong> ${bookingData.physiotherapist.name}</li>
              <li><strong>Clinic:</strong> ${bookingData.clinic.name}</li>
              <li><strong>Address:</strong> ${bookingData.clinic.addressLine1}, ${bookingData.clinic.city.name}</li>
              ${bookingData.treatmentType ? `<li><strong>Treatment:</strong> ${bookingData.treatmentType}</li>` : ''}
              <li><strong>Total Amount:</strong> €${bookingData.totalAmount}</li>
            </ul>
          </div>
          
          <p><strong>Status:</strong> <span style="color: #10b981;">Confirmed</span></p>
          
          <div style="background-color: #d1fae5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4>What to expect:</h4>
            <ul>
              <li>Your therapist will be ready for you at the scheduled time</li>
              <li>Please bring any relevant medical documents</li>
              <li>Wear comfortable clothing suitable for physiotherapy</li>
              <li>Arrive 10 minutes before your appointment</li>
            </ul>
          </div>
          
          <p>We look forward to seeing you!</p>
          
          <p>Best regards,<br>The Abaile Team</p>
        </div>
      </div>
    `
  }),

  // Booking reschedule email
  bookingReschedule: (bookingData, newDate, newTime) => ({
    subject: `Booking Rescheduled - ${bookingData.bookingReference}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f59e0b; color: white; padding: 20px; text-align: center;">
          <h1>Booking Rescheduled</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f9fafb;">
          <h2>Hello ${bookingData.patient.firstName} ${bookingData.patient.lastName},</h2>
          
          <p>Your physiotherapy appointment has been rescheduled.</p>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Updated Appointment Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Booking Reference:</strong> ${bookingData.bookingReference}</li>
              <li><strong>New Date:</strong> ${new Date(newDate).toLocaleDateString()}</li>
              <li><strong>New Time:</strong> ${newTime}</li>
              <li><strong>Duration:</strong> ${bookingData.durationMinutes} minutes</li>
              <li><strong>Therapist:</strong> ${bookingData.physiotherapist.name}</li>
              <li><strong>Clinic:</strong> ${bookingData.clinic.name}</li>
              <li><strong>Address:</strong> ${bookingData.clinic.addressLine1}, ${bookingData.clinic.city.name}</li>
              ${bookingData.treatmentType ? `<li><strong>Treatment:</strong> ${bookingData.treatmentType}</li>` : ''}
              <li><strong>Total Amount:</strong> €${bookingData.totalAmount}</li>
            </ul>
          </div>
          
          <p>If this new time doesn't work for you, please contact us as soon as possible to arrange an alternative.</p>
          
          <p>Best regards,<br>The Abaile Team</p>
        </div>
      </div>
    `
  }),

  // Payment success email
  paymentSuccess: (bookingData, recipient = 'patient') => {
    const isPatient = recipient === 'patient';
    const isTherapist = recipient === 'therapist';
    const isAdmin = recipient === 'admin';

    return {
      subject: `Payment Successful - ${bookingData.bookingReference}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #10b981; color: white; padding: 20px; text-align: center;">
            <h1>Payment Successful</h1>
          </div>
          
          <div style="padding: 20px; background-color: #f9fafb;">
            <h2>Hello ${isPatient ? bookingData.patient.firstName : isTherapist ? 'Dr. ' + bookingData.physiotherapist.name.split(' ')[1] : 'Admin'},</h2>
            
            <p>Payment has been successfully processed for the following booking:</p>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Booking Details:</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>Booking Reference:</strong> ${bookingData.bookingReference}</li>
                <li><strong>Patient:</strong> ${bookingData.patient.firstName} ${bookingData.patient.lastName}</li>
                <li><strong>Therapist:</strong> ${bookingData.physiotherapist.name}</li>
                <li><strong>Date:</strong> ${new Date(bookingData.appointmentDate).toLocaleDateString()}</li>
                <li><strong>Time:</strong> ${bookingData.appointmentTime}</li>
                <li><strong>Clinic:</strong> ${bookingData.clinic.name}</li>
                <li><strong>Amount Paid:</strong> €${bookingData.totalAmount}</li>
              </ul>
            </div>
            
            <div style="background-color: #d1fae5; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4>✅ Payment Status: Confirmed</h4>
              <p>Your booking is now confirmed and ready for the appointment.</p>
            </div>
            
            ${isPatient ? `
              <p>Please arrive 10 minutes before your appointment time. If you need to reschedule, please contact us at least 24 hours in advance.</p>
            ` : isTherapist ? `
              <p>Please prepare for this appointment. The patient has completed payment and the booking is confirmed.</p>
            ` : `
              <p>Payment has been processed successfully. The booking is now confirmed.</p>
            `}
            
            <p>Best regards,<br>The Abaile Team</p>
          </div>
        </div>
      `
    };
  },

  // Payment failed email
  paymentFailed: (bookingData, recipient = 'patient') => {
    const isPatient = recipient === 'patient';
    const isTherapist = recipient === 'therapist';
    const isAdmin = recipient === 'admin';

    return {
      subject: `Payment Failed - ${bookingData.bookingReference}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #ef4444; color: white; padding: 20px; text-align: center;">
            <h1>Payment Failed</h1>
          </div>
          
          <div style="padding: 20px; background-color: #f9fafb;">
            <h2>Hello ${isPatient ? bookingData.patient.firstName : isTherapist ? 'Dr. ' + bookingData.physiotherapist.name.split(' ')[1] : 'Admin'},</h2>
            
            <p>Payment processing failed for the following booking:</p>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Booking Details:</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>Booking Reference:</strong> ${bookingData.bookingReference}</li>
                <li><strong>Patient:</strong> ${bookingData.patient.firstName} ${bookingData.patient.lastName}</li>
                <li><strong>Therapist:</strong> ${bookingData.physiotherapist.name}</li>
                <li><strong>Date:</strong> ${new Date(bookingData.appointmentDate).toLocaleDateString()}</li>
                <li><strong>Time:</strong> ${bookingData.appointmentTime}</li>
                <li><strong>Clinic:</strong> ${bookingData.clinic.name}</li>
                <li><strong>Amount:</strong> €${bookingData.totalAmount}</li>
              </ul>
            </div>
            
            <div style="background-color: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4>❌ Payment Status: Failed</h4>
              <p>The payment could not be processed. Please try again or contact support.</p>
            </div>
            
            ${isPatient ? `
              <p>To complete your booking, please try the payment again or contact our support team for assistance.</p>
              <p>You can retry payment by visiting your booking dashboard.</p>
            ` : isTherapist ? `
              <p>The patient's payment has failed. The booking is currently on hold until payment is completed.</p>
            ` : `
              <p>Payment processing failed for this booking. Please monitor the situation and contact the patient if necessary.</p>
            `}
            
            <p>Best regards,<br>The Abaile Team</p>
          </div>
        </div>
      `
    };
  }
};

// Send email function
async function sendEmail(to, subject, html) {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

// Email notification functions
export async function sendBookingNotifications(bookingData) {
  const results = {
    user: null,
    therapist: null,
    admin: null
  };

  try {
    // Send confirmation email to user
    const userTemplate = emailTemplates.userConfirmation(bookingData);
    results.user = await sendEmail(
      bookingData.patient.email,
      userTemplate.subject,
      userTemplate.html
    );

    // Send notification to therapist
    const therapistTemplate = emailTemplates.therapistNotification(bookingData);
    results.therapist = await sendEmail(
      bookingData.physiotherapist.email,
      therapistTemplate.subject,
      therapistTemplate.html
    );

    // Send notification to admin (if admin email is configured)
    if (process.env.ADMIN_EMAIL) {
      const adminTemplate = emailTemplates.adminNotification(bookingData);
      results.admin = await sendEmail(
        process.env.ADMIN_EMAIL,
        adminTemplate.subject,
        adminTemplate.html
      );
    }

    return results;
  } catch (error) {
    console.error('Error sending booking notifications:', error);
    return { error: error.message };
  }
}

export async function sendBookingCancellationNotification(bookingData, cancelledBy) {
  try {
    const template = emailTemplates.bookingCancellation(bookingData, cancelledBy);
    
    // Send to patient
    const patientResult = await sendEmail(
      bookingData.patient.email,
      template.subject,
      template.html
    );

    // Send to therapist
    const therapistResult = await sendEmail(
      bookingData.physiotherapist.email,
      template.subject,
      template.html
    );

    // Send to admin
    let adminResult = null;
    if (process.env.ADMIN_EMAIL) {
      adminResult = await sendEmail(
        process.env.ADMIN_EMAIL,
        template.subject,
        template.html
      );
    }

    return {
      patient: patientResult,
      therapist: therapistResult,
      admin: adminResult
    };
  } catch (error) {
    console.error('Error sending cancellation notification:', error);
    return { error: error.message };
  }
}

export async function sendBookingConfirmationNotification(bookingData) {
  try {
    const template = emailTemplates.bookingConfirmation(bookingData);
    
    // Send confirmation to patient
    const patientResult = await sendEmail(
      bookingData.patient.email,
      template.subject,
      template.html
    );

    // Send to admin
    let adminResult = null;
    if (process.env.ADMIN_EMAIL) {
      adminResult = await sendEmail(
        process.env.ADMIN_EMAIL,
        `Booking Confirmed by Therapist - ${bookingData.bookingReference}`,
        `Therapist ${bookingData.physiotherapist.name} has confirmed booking ${bookingData.bookingReference} for patient ${bookingData.patient.firstName} ${bookingData.patient.lastName}.`
      );
    }

    return {
      patient: patientResult,
      admin: adminResult
    };
  } catch (error) {
    console.error('Error sending confirmation notification:', error);
    return { error: error.message };
  }
}

export async function sendBookingRescheduleNotification(bookingData, newDate, newTime) {
  try {
    const template = emailTemplates.bookingReschedule(bookingData, newDate, newTime);
    
    // Send to patient
    const patientResult = await sendEmail(
      bookingData.patient.email,
      template.subject,
      template.html
    );

    // Send to therapist
    const therapistResult = await sendEmail(
      bookingData.physiotherapist.email,
      `Booking Rescheduled - ${bookingData.bookingReference}`,
      `Booking ${bookingData.bookingReference} has been rescheduled to ${new Date(newDate).toLocaleDateString()} at ${newTime}.`
    );

    // Send to admin
    let adminResult = null;
    if (process.env.ADMIN_EMAIL) {
      adminResult = await sendEmail(
        process.env.ADMIN_EMAIL,
        `Booking Rescheduled - ${bookingData.bookingReference}`,
        `Booking ${bookingData.bookingReference} has been rescheduled to ${new Date(newDate).toLocaleDateString()} at ${newTime}.`
      );
    }

    return {
      patient: patientResult,
      therapist: therapistResult,
      admin: adminResult
    };
  } catch (error) {
    console.error('Error sending reschedule notification:', error);
    return { error: error.message };
  }
}

// Payment success notification
export async function sendPaymentSuccessNotification(bookingData, recipient = 'patient') {
  try {
    const template = emailTemplates.paymentSuccess(bookingData, recipient);
    
    let emailResult = null;
    
    if (recipient === 'patient') {
      emailResult = await sendEmail(
        bookingData.patient.email,
        template.subject,
        template.html
      );
    } else if (recipient === 'therapist') {
      emailResult = await sendEmail(
        bookingData.physiotherapist.email,
        template.subject,
        template.html
      );
    } else if (recipient === 'admin' && process.env.ADMIN_EMAIL) {
      emailResult = await sendEmail(
        process.env.ADMIN_EMAIL,
        template.subject,
        template.html
      );
    }

    return { success: true, recipient, result: emailResult };
  } catch (error) {
    console.error('Error sending payment success notification:', error);
    return { error: error.message };
  }
}

// Payment failed notification
export async function sendPaymentFailedNotification(bookingData, recipient = 'patient') {
  try {
    const template = emailTemplates.paymentFailed(bookingData, recipient);
    
    let emailResult = null;
    
    if (recipient === 'patient') {
      emailResult = await sendEmail(
        bookingData.patient.email,
        template.subject,
        template.html
      );
    } else if (recipient === 'therapist') {
      emailResult = await sendEmail(
        bookingData.physiotherapist.email,
        template.subject,
        template.html
      );
    } else if (recipient === 'admin' && process.env.ADMIN_EMAIL) {
      emailResult = await sendEmail(
        process.env.ADMIN_EMAIL,
        template.subject,
        template.html
      );
    }

    return { success: true, recipient, result: emailResult };
  } catch (error) {
    console.error('Error sending payment failed notification:', error);
    return { error: error.message };
  }
}
