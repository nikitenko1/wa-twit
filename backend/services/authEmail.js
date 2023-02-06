const authEmail = (text, url) => {
  const data = `
        <div style="border: 5px solid #e1fa02; padding: 15px;">
          
          <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                <div style="margin:50px auto;width:70%;padding:20px 0">
                <div style="border-bottom:1px solid #eee"><a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600;color:#FFC107;">Twizzer</a></div>
                <p style="font-size:1.1em">Hi,</p>
                <p>${text}</p></br><p>${url}</p><hr style="border:none;border-top:1px solid #eee" />
                <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300"><p>JSC Kyiv Postal Service</p></div></div></div> 
         
                <div style="margin-top: 20px;">
            <p>Thank you for using <strong>JSC Kyiv Postal Service</strong>"
            <p>Warm Regards,</p>
            <p>- JSC Kyiv Postal Service | Kyiv Team -</p>
          </div>
        </div>
      `;
  return data;
};

module.exports = authEmail;
