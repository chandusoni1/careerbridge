const express = require('express');
const router = express.Router();
const User = require('../users/user.model');
const Job = require('../jobs/job.model');
const Post = require('../posts/post.model');
const asyncHandler = require('../../utils/asyncHandler');

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const q = (req.query.q || '').trim();
    if (!q) {
      return res.json({ users: [], jobs: [], posts: [] });
    }

    const regex = new RegExp(q, 'i');

    const [users, jobs, posts] = await Promise.all([
      User.find(
        {
          $or: [
            { name: regex },
            { headline: regex },
            { company: regex },
            { skills: { $in: [regex] } },
          ],
        },
        { password: 0 }
      )
        .limit(10)
        .sort({ createdAt: -1 }),

      Job.find({
        $or: [
          { title: regex },
          { company: regex },
          { skillsRequired: { $in: [regex] } },
        ],
      })
        .populate('postedBy', 'name company jobRole profilePhoto')
        .limit(10)
        .sort({ createdAt: -1 }),

      Post.find({
        $or: [{ content: regex }, { tags: { $in: [regex] } }],
      })
        .populate('author', 'name role company branch profilePhoto')
        .limit(10)
        .sort({ createdAt: -1 }),
    ]);

    res.json({ users, jobs, posts });
  })
);

module.exports = router;
