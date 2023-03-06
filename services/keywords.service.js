const makeKeywords = (title) => {
  var keyTitle = title.split(" ").slice(0, 3).join(" ");
  let keywords = [keyTitle, keyTitle + " deals", keyTitle + " coupons"];
  return keywords;
};

module.exports = { makeKeywords };
