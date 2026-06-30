import Message from '../models/Message.js';

// Get chat history with another user
export const getChatHistory = async (req, res) => {
  const { partnerId } = req.params;
  const userId = req.user._id;

  try {
    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: partnerId },
        { sender: partnerId, recipient: userId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'name avatar role')
      .populate('recipient', 'name avatar role');

    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
