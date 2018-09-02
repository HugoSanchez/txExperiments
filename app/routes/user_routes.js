// Libraries
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Packages
const Account = require('../schemas/accounts')

module.exports = function(app, db) {

  // SIGN UP
  app.post('/signup', function(req, res) {
    bcrypt.hash(req.body.password, 10, function(err, hash){
      if(err) {
        return res.status(500).json({
          error: err
        });
      }
      else {
        const account = new Account({
          username: req.body.username,
          password: hash
        });
        account.save().then(function(result){
          console.log(result);
          res.status(200).json({
            success: 'New user has beeen created'
          });
        }).catch(error => {
          res.status(500).json({
            error: err
          });
        });
      }
    });
  });

  // SIGN IN
  app.post('/signin', function(req, res){
    Account.findOne({ username: req.body.username })
    .exec()
    .then(function(account){
      bcrypt.compare(req.body.password, account.password, function(err, result){
        if(err) {
          return res.status(401).json({
            failed: 'Unauthorized Access'
          });
        }
        if(result) {
          const JWTToken = jwt.sign({
            username: account.username,
            _id: account._id
          },
          'secret',
          {
            expiresIn: '2h'
          });
          return res.status(200).json({
            success: 'Welcome to the JWT Auth',
            token: JWTToken
          });
        }
        return res.status(401).json({
          failed: 'Unauthorized Access'
        });
      });
    })
    .catch(error => {
      res.status(500).json({
        error: error
      });
    });
  });

} //
