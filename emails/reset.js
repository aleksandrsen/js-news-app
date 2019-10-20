const keys = require('../keys');

module.exports = function (email, token) {
  return {
      to: email,
      from: keys.EMAIL_FROM,
      subject: 'Reset password',
      html: `
        <h1>You forgot password?</h1>
        <p>If no ignore this message</p>
        <p>Else press link</p>
        <p><a href="${keys.BASE_URL}/password/${token}">Reset password</a></p>
        <hr>
        <a href="${keys.BASE_URL}">News application</a>
      `
  }
};