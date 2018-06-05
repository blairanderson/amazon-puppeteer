function DOCS(req, res) {
  res.status(200).json({
    routes: [
      "/s?keywords=something&asin=BOOFOO1234&api_key=poopoo",
      "/:asin?api_key=poopoo"
    ]
  });
}

module.exports = { DOCS };
