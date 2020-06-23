/*
 * @Author: your name
 * @Date: 2020-06-22 11:40:21
 * @LastEditTime: 2020-06-22 11:42:22
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \vue_music\config\dev.js
 */

 'use strict'
 const merge = require('webpack-merge')
 const prodEnv = require('./prod.env')
 
 module.exports = merge(prodEnv, {
   NODE_ENV: '"development"'
 })
