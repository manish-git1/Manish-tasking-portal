import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Task } from '@/models/Task';
import { User } from '@/models/User';
import { RescheduleRequest } from '@/models/RescheduleRequest';
import { getAuthUser } from '@/lib/auth-middleware';

export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    await connectDB();

    const [totalTasks, completedTasks, totalUsers, pendingRequests, overdueTasks] = await Promise.all([
      Task.countDocuments(),
      Task.countDocuments({ status: 'completed' }),
      User.countDocuments({ role: 'member', isActive: true }),
      RescheduleRequest.countDocuments({ status: 'pending' }),
      Task.countDocuments({ deadline: { $lt: new Date() }, status: { $ne: 'completed' } }),
    ]);

    const tasksByStatus = await Task.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const tasksByPriority = await Task.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    // Tasks created in last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dailyTasks = await Task.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Top performers
    const topMembers = await Task.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$assignedTo', completed: { $sum: 1 } } },
      { $sort: { completed: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { name: '$user.name', email: '$user.email', completed: 1 } },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        stats: { totalTasks, completedTasks, totalUsers, pendingRequests, overdueTasks, completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0 },
        tasksByStatus,
        tasksByPriority,
        dailyTasks,
        topMembers,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
