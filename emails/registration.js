const keys = require('../keys');

module.exports = function (email) {
  return {
      to: email,
      from: keys.EMAIL_FROM,
      subject: 'Account create',
      html: `
        <h1>Welcome to news application</h1>
        <p>Your created account</p>
        ${email}
        <hr>
        <a href="${keys.BASE_URL}">News application</a>
      `
  }
};