const multer = require('multer');
const { ObjectId } = require('mongodb');

const uploadAvatar = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 300 * 1024}
})

module.exports = {
    route: async(app, db) => {
        app.post('/api/uploadavatar/:userId/avatar', uploadAvatar.single('avatar'), async(req, res) => {
            if (!req.file) return res.status(400).json({ error: 'No file' });

            // Generate URL to store into MongoDB
            const mime = req.file.mimetype;
            const b64 = req.file.buffer.toString('base64');
            const avatarUrl = `data:${mime};base64,${b64}`;
            const userId = new ObjectId(String(req.params.userId))

            try {
                await db.collection('users').updateOne(
                { _id: userId },
                {
                    $set: { avatar: avatarUrl }
                }
            );
            res.json({avatar: avatarUrl})
            }
            catch(error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to upload user avatar.' });
            }
        })
    }
}