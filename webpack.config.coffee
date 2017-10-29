#import webpack from 'webpack'
#import coffee from 'file.coffee'
#import path from 'path'
webpack=require 'webpack'
path=require 'path'
#HtmlWebpackPlugin=require 'html-webpack-plugin'
CleanWebpackPlugin=require 'clean-webpack-plugin'

module.exports=
    entry:
        index:'./index.coffee'
    output:
        path:__dirname
        filename:'index.js'
    resolve:
        modules:[
            path.resolve('./node_modules')
        ]
    module:
        rules:[
            test:/\.coffee$/
            use:[
                loader:'coffee-loader'
                options:
                    sourceMap:true
                    pretty:true
            ]
        ,
#            test:/\.pug$/,
#            use:['html-loader','pug-html-loader']
#        ,
#           test:/\.txt$/,
#           use:'raw-loader' 
#       ,
           test:/\.css$/,
           use:['style-loader','css-loader']
        ,
#           test:/\.styl$/,
#           use:['style-loader','css-loader','stylus-loader']
#       ,
#           test:/\.(png|svg|jpg|gif)$/,
#           use:['file-loader']
#       ,
        ]
    plugins:[
#        new HtmlWebpackPlugin
#            template:'./app/index.pug'
        new CleanWebpackPlugin ['app/build']
#        new webpack.ProvidePlugin
#            $:'jquery'
#            jQuery: 'jquery'
#            'window.jQuery': 'jquery'
#            Popper: ['popper.js', 'default']
#new webpack.optimize.UglifyJsPlugin()
    ]
    devtool:'inline-source-map'
#    devServer:
#        contentBase:'./app/build'
#        host:'0.0.0.0' 
