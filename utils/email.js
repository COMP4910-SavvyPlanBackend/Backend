const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');
/** Email
 * @class Email
 */
module.exports = class Email {
  /**
   * @constructor
   * @param user user obj
   * @param url
   */
  constructor(user, url, InviteEmail) {
    this.to = user.email;
    this.url = url;
    this.InviteEmail = InviteEmail;
    this.inviteCode = user.referralCode;

    //When using sendgrid the from email address must match the email defined in Sendgrid. 
    this.from = `Savvy Plan<rhouma30@outlook.com>`;
  }

  /** newTransport
   * @method creates email transport with environment vars for service
   */
  newTransport() {
    if (process.env.NODE_ENV === 'production') {

      // Sendgrid
      return nodemailer.createTransport({
        host:process.env.SENDGRID_HOST,
        port:process.env.SENDGRID_PORT,
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }
    
    //mailtrap

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  /** send
   * Sends a email based on the specified template
   * @async
   * @method
   * @param template Pug template
   * @param subject  Subject line
   */
  async send(template, subject) {
    const html = pug.renderFile(`${__dirname}/email/${template}.pug`, {
      url: this.url,
      inviteCode: this.inviteCode,
      subject,
    });

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    };

    // This will be used when sending out invitation
    const mailOptions2 = {
      from: this.from,
      to: this.InviteEmail,
      subject,
      html,
      text: htmlToText(html),
    };

    if (this.InviteEmail !== '')
      await this.newTransport().sendMail(mailOptions2);
    else{
      await this.newTransport().sendMail(mailOptions);
  }
  }

  /** sendWelcome
   * @async
   * @method
   * sends new User welcome email
   */
  async sendWelcome() {
    await this.send(
      'welcome',
      'Welcome to Savvy Plan the Financial Advising platform!'
    );
  }

  /** sendPasswordReset
   * @async
   * @method
   * sends Password Reset email
   */
  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }

  /** sendResetConfirmation
   * @async
   * @method
   * sends reset password confirmation email
   */
  async sendResetConfirmation() {
    await this.send('confirmPasswordReset', 'Your Password has been changed');
  }

  /** sendInvite
   * @async
   * @method
   * sends Invite email to join
   */
  async sendInvite() {
    await this.send('invite', 'Join Savvy Plan');
  }

  /** sendEmailChangeConfirmation
   * @async
   * @method
   * sends email change confirmation email
   */
  async sendEmailChangeConfirmation() {
    await this.send('confirmEmailChanged', 'SavvyPlan Email changed');
  }
};
