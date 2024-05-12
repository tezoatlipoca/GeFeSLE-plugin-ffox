var gulp = require('gulp');

gulp.task('copy-easymde', function() {
    return gulp.src('node_modules/easymde/dist/*')
        .pipe(gulp.dest('lib/easymde/'));
});

gulp.task('copy-showdown', function(){
    return gulp.src('node_modules/showdown/dist/*')
        .pipe(gulp.dest('lib/showdown/'));
});

gulp.task('watch', function() {
    gulp.watch('node_modules/easymde/dist/*', gulp.series('copy-easymde'));
    gulp.watch('node_modules/showdown/dist/*', gulp.series('copy-showdown'));
});

gulp.task('default', gulp.series('copy-easymde', 'copy-showdown', 'watch'));