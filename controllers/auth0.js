const Api500Error = require('../error_handling/api500Error');
const Api401Error = require('../error_handling/api401Error');

const getLoginStatus = async (req, res, next) => {
  try {
    return res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
  } catch (error) {
    return next(
      new Api500Error(
        'Login Error',
        'An error occurred while retrieving login status.',
      ),
    );
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    if (!req.oidc.isAuthenticated()) {
      return next(
        new Api401Error(
          'Not Logged In',
          'You are not authorized to access this page. Please log in first.',
        ),
      );
    }
    return res.send(JSON.stringify(req.oidc.user));
  } catch (error) {
    return next(
      new Api500Error(
        'Get Profile Error',
        'An error occurred while getting the user profile.',
      ),
    );
  }
};

module.exports = {
  getLoginStatus,
  getUserProfile
};
