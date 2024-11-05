const UserNotification = require('../../Models/notifications');

const addNotification = async (currentId, newNotification) => {
  try {
    let userNotifications = await UserNotification.findOne({ currentId });

    if (!userNotifications) {
      userNotifications = new UserNotification({
        currentId,
        notifications: [newNotification],
      });
    } else {
      userNotifications.notifications.push(newNotification);
    }

    await userNotifications.save();
    return { success: true, message: 'Notification added successfully' };
  } catch (error) {
    return { success: false, message: 'Error adding notification' };
  }
};

module.exports = {
  addNotification,
};
