import Notification from "../model/notification.model.js"

export const getNotifications = async (req, res) => {

    try {
        const userId = req.user._id

        const notifications = await Notification.find({ to: userId }).populate({
            path: "from",
            select: "username profileImg"
        })

        await Notification.updateMany({ to: userId }, { read: true })

        return res.status(200).json(notifications)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Internal Server Error." })
    }
}

export const deleteNotifications = async (req, res) => {
    try {
        const userId = req.user._id

        await Notification.deleteMany({ to: userId })

        return res.status(200).json({ message: "Notifications Deleted." })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Internal Server Error." })
    }
}