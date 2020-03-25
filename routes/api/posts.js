const express = require('express')
const router = express.Router()

const { check, validationResult } = require('express-validator')

const auth = require('../../middleware/auth')
const User = require('../../models/User')
const Profile = require('../../models/Profile')
const Post = require('../../models/Post')

// @route   POST api/posts
// @desc    Create a post
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('text', 'Text is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    try {
      const user = await User.findById(req.user.id).select('-password')
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      })
      const post = await newPost.save()
      res.status(200).json(post)
    } catch (err) {
      console.error(err.message)
      res.status(500).send('Server error')
    }
  }
)

// @route   GET api/posts
// @desc    GET all posts
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 })
    res.json(posts)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// @route   GET api/posts/:post_id
// @desc    GET post by ID
// @access  Private
router.get('/:post_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id)
    if (!post) {
      return res.status(404).json({ msg: 'Post not found!' })
    }
    res.json(post)
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found!' })
    }
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// @route   DELETE api/posts/:post_id
// @desc    DELETE a post
// @access  Private
router.delete('/:post_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id)

    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' })
    }
    if (!post) {
      return res.status(404).json({ msg: 'Post not found!' })
    }

    await post.remove()
    res.status(204).send()
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found!' })
    }
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// @route   PUT api/posts/like/:post_id
// @desc    Like a post
// @access  Private
router.put('/like/:post_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id)

    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length > 0
    ) {
      return res.status(400).json({ msg: 'Post already liked' })
    }
    post.likes.unshift({ user: req.user.id })
    await post.save()

    res.status(200).json(post.likes)
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found!' })
    }
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// @route   PUT api/posts/unlike/:post_id
// @desc    Unlike a post
// @access  Private
router.put('/unlike/:post_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id)

    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length ===
      0
    ) {
      return res.status(400).json({ msg: 'Post has not yet been liked' })
    }

    const removeIndex = post.likes
      .map(like => like.user.toString())
      .indexOf(req.user.id)

    post.likes.splice(removeIndex, 1)

    await post.save()

    res.status(200).json(post.likes)
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found!' })
    }
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// @route   POST api/posts/comment/:post_id
// @desc    Comment on a post
// @access  Private
router.post(
  '/comment/:post_id',
  [
    auth,
    [
      check('text', 'Text is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    try {
      const user = await User.findById(req.user.id).select('-password')
      const post = await Post.findById(req.params.post_id)

      if (!post) {
        res.status(404).json({ msg: 'Post not found' })
      }

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      }

      post.comments.unshift(newComment)
      await post.save()

      res.status(200).json(post.comments)
    } catch (err) {
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Post not found!' })
      }
      console.error(err.message)
      res.status(500).send('Server error')
    }
  }
)

// @route   DELETE api/posts/comment/:post_id/:comment_id
// @desc    Delete comment
// @access  Private

router.delete('/comment/:post_id/:comment_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id)
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' })
    }

    const comment = post.comments.find(
      comment => comment.id === req.params.comment_id
    )
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' })
    }
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' })
    }

    const removeIndex = post.comments
      .map(comment => comment.user.toString())
      .indexOf(req.user.id)

    post.comments.splice(removeIndex, 1)

    await post.save()
    res.status(200).json(post.comments)
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'ObjectId not exists' })
    }
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

module.exports = router
