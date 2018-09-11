// Libraries
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Packages
const Account = require('../schemas/accounts')

module.exports = function(app, db) {

  //First Access Authentication Point
  app.get('/auth', function (req, res){
    Account.findOne({ _id: req.headers.user_id})
    .exec()
    .then(account => {
      if (account) {
        res.send({ success: 'existing user' })
      } else {
        res.send({ erros: 'Unidentified user' })
      }
    })
  })

  // Sending Expiring Access Token
  app.post('/checkPassword', function(req, res){
    Account.findOne({ _id: req.body.user_id})
    .exec()
    .then(function(account){
      bcrypt.compare(req.body.user.password, account.password, function(err, result){
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
          );
          const sessionJWTToken = jwt.sign({
            token: JWTToken
          },
          'secret',
          {
            expiresIn: '1m'
          });
          return res.status(200).json({
            success: 'Welcome to the JWT Auth',
            sessionToken: sessionJWTToken
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
  })

  // SIGN UP
  app.post('/signup', function(req, res) {
    bcrypt.hash(req.body.user.password, 10, function(err, hash){
      if(err) {
        return res.status(500).json({
          error: err
        });
      }
      else {
        const account = new Account({
          username: req.body.user.username,
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
    console.log(req.body)
    Account.findOne({ username: req.body.user.username })
    .exec()
    .then(function(account){
      bcrypt.compare(req.body.user.password, account.password, function(err, result){
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
          );
          const sessionJWTToken = jwt.sign({
            token: JWTToken
          },
          'secret',
          {
            expiresIn: '1m'
          });
          return res.status(200).json({
            success: 'Welcome to the JWT Auth',
            token: JWTToken,
            sessionToken: sessionJWTToken
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
