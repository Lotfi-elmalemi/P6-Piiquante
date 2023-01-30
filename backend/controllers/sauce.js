const Sauce = require('../models/sauce.model');
const fs = require('fs');

exports.getAllSauces = (req, res, next) => {
  Sauce.find()
  .then(sauces => res.status(200).json(sauces))
  .catch(error => res.status(400).json({error}));
 };


exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject.userId;
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
    });
    sauce.save()
    .then(() => { res.status(201).json({message: 'Sauce enregistré !'})})
    .catch(error => { res.status(400).json( { error })})
    console.log(sauce)
 };

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  if (sauceObject.imageUrl == null) {
    Sauce.updateOne(
      { _id: req.params.id },
      { ...sauceObject, _id: req.params.id }
    )
      .then(() => res.status(200).json({ message: "Objet modifié" }))
      .catch((error) => res.status(400).json({ error }));
  } else {
    Sauce.findOne({ _id: req.params.id }).then((sauce) => {
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.updateOne(
          { _id: req.params.id },
          { ...sauceObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Objet supprimé" }))
          .catch((error) => res.status(400).json({ error }));
      });
    });
  }
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({id: req.params.id})
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({message: 'Non-autorisé'});
            } else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({id: req.params.id})
                        .then(() => { res.status(200).json({message: 'Sauce supprimé !'})})
                        .catch(error => res.status(401).json({ error }));
                })
            }
        })
        .catch(error => {
            res.status(500).json({error});
        })
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({error}));
};

exports.likeSauce = async (req, res) => {
    const likeStatus = req.body.like;
    const authUserId = req.auth.userId;
    const filterById = { _id: req.params.id };
  
    const addLike = {
      $inc: { likes: +1 },
      $push: { usersLiked: authUserId },
    };
    const addDislike = {
      $inc: { dislikes: +1 },
      $push: { usersDisliked: authUserId },
    };
    const removeLike = {
      $inc: { likes: -1 },
      $pull: { usersLiked: authUserId },
    };
    const removeDislike = {
      $inc: { dislikes: -1 },
      $pull: { usersDisliked: authUserId },
    };
  
    try {
      const sauce = await Sauce.findOne(filterById);
      switch (likeStatus) {
        case 1: {
          if (!sauce.usersLiked.includes(authUserId)) {
            await Sauce.findOneAndUpdate(filterById, addLike, { new: true });
            res.status(201).json({ message: `Vous avez like ${sauce.name} sauce ` });
          } else {
            return;
          }
  
          break;
        }
        case -1: {
          if (!sauce.usersDisliked.includes(authUserId)) {
            await Sauce.findOneAndUpdate(filterById, addDislike, { new: true });
            res.status(201).json({ message: `Vous avez dislike ${sauce.name} sauce` });
          } else {
            return;
          }
  
          break;
        }
        case 0: {
          if (sauce.usersLiked.includes(authUserId)) {
            await Sauce.findOneAndUpdate(filterById, removeLike, { new: true });
            res
              .status(201)
              .json({ message: `Vous avez retiré votre like de ${sauce.name}` });
          } else if (sauce.usersDisliked.includes(authUserId)) {
            await Sauce.findOneAndUpdate(filterById, removeDislike, {
              new: true,
            });
            res.status(201).json({
              message: `Vous avez retiré votre dislike de ${sauce.name} sauce`,
            });
          } else {
            return;
          }
          break;
        }
      }
    } catch (error) {
      res.status(400).json(error);
    }
  };