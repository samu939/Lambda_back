
const Mailjet = require('node-mailjet')

export abstract class EmailSender {
    private subjectText: string
    private textPart: string
    private htmlPart: string  
    private senderEmail = process.env.SENDER_EMAIL
    private senderName = process.env.APP_NAME
    private mailjet = null

    constructor() {
        const key_public = process.env.MAILJET_PUBLIC_KEY
        const key_private = process.env.MAILJET_PRIVATE_KEY
        this.mailjet = Mailjet.apiConnect( key_public, key_private )
    }

    abstract setVariable( variable: string ): void

    public setTextPart( text: string ){
        this.textPart = text
    }
    
    public setSubjectText( text: string ){
        this.subjectText = text
    }

    public setHtmlPart( html: string ){
        this.htmlPart = html
    }

    public sendEmail( 
        emailReceiver: string, nameReceiver: string
    ): void {
        const request = this.mailjet.post('send', { version: 'v3.1' }).request({
            Messages: [{
                From: { Email: this.senderEmail, Name: this.senderName, },
                To: [ { Email: emailReceiver, Name: nameReceiver, }, ],
                Subject: this.subjectText,
                TextPart: this.textPart,
                HTMLPart: this.htmlPart, 
            }],
          })
        .then( result => { console.log('email_sended') } )
        .catch( err => { console.log('error_in_email_sending') } )
    }
}
