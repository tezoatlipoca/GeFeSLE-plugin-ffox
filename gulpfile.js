var gulp = require('gulp');

gulp.task('copy', function() {
    return gulp.src('node_modules/easymde/dist/*')
        .pipe(gulp.dest('lib/easymde/'));
    
});

gulp.task('copy', function(){
    return gulp.src('node_modules/showdown/dist/*')
        .pipe(gulp.dest('lib/showdown/'));
})