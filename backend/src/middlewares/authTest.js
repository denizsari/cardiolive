exports.protect = (req, res, next) => {
  next();
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    next();
  };
};
