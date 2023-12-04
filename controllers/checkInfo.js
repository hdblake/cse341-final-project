/******************************************************************
 * function: hasExtraInfo
 * In this function you can put the permittedKeys that 
 * the dabase accept, if the user request has an extra field
 * it will return true(meaning that the test failed and should 
 * display an error).
 *******************************************************************/
function hasExtraInfo(userRequest, permittedKeys) {
    const userKeys = Object.keys(userRequest);
    
    for (let i = 0; i < userKeys.length; i++) {
      if (!permittedKeys.includes(userKeys[i])) {
        return {
            result: true, 
            message: " Additional unauthorized information found in user request."};
        }
    }
    
    return {result: false};
}

function hasRequiredKeys(userRequest, requiredKeys) {
    for (let i = 0; i < requiredKeys.length; i++) {
      if (!Object.prototype.hasOwnProperty.call(userRequest, requiredKeys[i])) {
        return {
          result: true,
          message: `The '${requiredKeys[i]}' key is missing from the user request.`
        };
      }
    }
  
    return { result: false };
}
  
module.exports = {
    hasExtraInfo,
    hasRequiredKeys
};
  