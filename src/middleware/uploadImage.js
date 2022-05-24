const multer = require('multer');

module.exports = (multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, './src/uploads');
        },
        filename: (req, file, cb) => {
            const { id } = req.params;
            cb(null, `${id}.jpeg`);
        },
    }),
}));