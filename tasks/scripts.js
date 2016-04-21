import gulp from 'gulp';
import gulpif from 'gulp-if';
import named from 'vinyl-named';
import webpack from 'webpack';
import gulpWebpack from 'webpack-stream';
import plumber from 'gulp-plumber';
import livereload from 'gulp-livereload';
import args from './lib/args';
import path from 'path';

gulp.task('scripts', (cb) => {
  return gulp.src('app/scripts/*.js')
    .pipe(plumber())
    .pipe(named())
    .pipe(gulpWebpack({
      devtool: args.sourcemaps ? 'source-map' : null,
      watch: args.watch,
      plugins: [
        new webpack.DefinePlugin({
          '__ENV__': JSON.stringify(args.production ? 'production' : 'development'),
          '__VENDOR__': JSON.stringify(args.vendor)
        }),
      ].concat(args.production ? [
        new webpack.optimize.UglifyJsPlugin()
      ] : []),
      module: {
        noParse: /node_modules\/json-schema\/lib\/validate\.js/,
        preLoaders: [{
          test: /\.js$/,
          loader: 'eslint-loader',
          exclude: /node_modules/
        }],
        loaders: [{
          test: /\.css$/,
          loader: 'style-loader!css-loader'
        }, {
          test: /\.html$/,
          loader: 'html'
        }, {
          test: /\.js$/,
          loader: 'babel?cacheDirectory'
        }, {
          test: /\.json$/,
          loader: 'json'
        }, {
          test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          loader: 'file'
        }, {
          test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          loader: 'url-loader?limit=10000&minetype=application/font-woff'
        }]
      },
      modulesDirectories: ['node_modules'],
      resolve: {
        root: path.resolve(__dirname),
        extensions: ['', '.webpack.js', '.web.js', '.js']
      },
      resolveLoader: {
        root: path.resolve('node_modules')
      },
      node: {
        net: "empty",
        tls: "empty",
        fs: "empty"
      },
      eslint: {
        configFile: '.eslintrc'
      }
    }))
    .pipe(gulp.dest(`dist/${args.vendor}/scripts`))
    .pipe(gulpif(args.watch, livereload()));
});