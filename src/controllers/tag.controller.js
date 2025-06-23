const { Tag } = require('../../models');

exports.getAllTags = async (req, res) => {
  try {
    const tags = await Tag.findAll();
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

exports.createTag = async (req, res) => {
  try {
    const {name}=req.body;
    const tag=await Tag.create({name})
    res.status(201).json({message : "Tag created",tag});
  } catch (error) {
    res.status(500).json({ error: 'Failed to create tag' });
  }
};
