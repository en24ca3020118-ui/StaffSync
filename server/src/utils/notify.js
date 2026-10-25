import Notification from '../models/Notification.js';

/**
 * Create a notification for one or more users.
 * @param {string|string[]} userIds - single userId or array of userIds
 * @param {string} message
 */
const notify = async (userIds, message) => {
  const ids = Array.isArray(userIds) ? userIds : [userIds];
  const docs = ids.map((user) => ({ user, message }));
  await Notification.insertMany(docs);
};

export default notify;
