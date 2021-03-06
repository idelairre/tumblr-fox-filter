import gulp from 'gulp';
import gulpif from 'gulp-if';
import htmlmin from 'gulp-htmlmin';
import livereload from 'gulp-livereload';
import args from './lib/args';

gulp.task('pages', () => {
  return gulp.src('app/background/pages/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest(`dist/${args.vendor}/pages`))
    .pipe(gulpif(args.watch, livereload()));
});
