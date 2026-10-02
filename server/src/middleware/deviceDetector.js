const UAParser = require("ua-parser-js");

const deviceDetector = (req, res, next) => {
  const userAgentString = req.headers["user-agent"] || "";
  const parser = new UAParser(userAgentString);
  const result = parser.getResult();

  // Extract browser and OS details
  const browser = result.browser.name || "Unknown Browser";
  const os = result.os.name || "Unknown OS";
  
  // Determine device type (Desktop, Laptop, or Mobile)
  let deviceType = "Desktop";
  const type = result.device.type;

  if (type === "mobile" || type === "tablet") {
    deviceType = "Mobile";
  } else if (/Mobi|Android/i.test(userAgentString)) {
    deviceType = "Mobile";
  } else {
    deviceType = /Macintosh|Windows NT.*Win64/i.test(userAgentString) ? "Laptop" : "Desktop";
  }

  // Extract IP Address
  const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";

  // Attach parsed info to the request object so the login controller can use it
  req.clientInfo = {
    browser,
    os,
    deviceType,
    ipAddress,
  };

  next();
};

module.exports = deviceDetector;