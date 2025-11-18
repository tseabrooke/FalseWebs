Qualtrics.SurveyEngine.addOnReady(function () {
    var qid = this.questionId;
    var qContainer = jQuery("#" + qid);

    // Get current trial stimulus
    var trial = "${lm://Field/1}";

    // Get comment divs
    var prevCommentDiv = qContainer.find('.prev-comment');
    var currentCommentDiv = qContainer.find('.current-comment');
	
	var presentationGroup = "${e://Field/presentationType}";
    var prevStim = null;
    var leftImg = qContainer.find('.left-face-image')[0];
    var prevLabel = qContainer.find('.prev-comment')[0];
	var currImg = qContainer.find('.face-image')[0];
	var scaleLabels = qContainer.find('.scale-labels')[0];
	var trainingTable = qContainer.find('.training-container')[0];

    // --- CASE 1: Attention Check ---
    if (trial === "attention_check") {
	
        jQuery("#" + qid + " .QuestionText").prepend(
            '<div class="attention-container">' +
            '<div class="attention-text">' +
            'ATTENTION CHECK<br>Please select <strong>4</strong> to continue.' +
            '</div>' +
            '</div>'
        );
	
		leftImg.style.visibility = 'hidden';
        jQuery(prevLabel).hide();
		currentCommentDiv.hide();
		currImg.hide();
		scaleLabels.hide();
		trainingTable.hide();

        this.hideNextButton();
        var hasResponded = false;

        qContainer.find('input[type="radio"]').on('click', function () {
            if (!hasResponded) {
                hasResponded = true;
                jQuery("#NextButton").click();
            }
        });

    } else {
        // --- CASE 2: Regular face trial ---
		
		// To quickly skip through the trials
		//this.clickNextButton();

        var trainingOrder = Qualtrics.SurveyEngine.getEmbeddedData("trainingOrder");
        var stim, feedback;
        if (trainingOrder === "Interleaved") {
            stim = "${lm://Field/1}";
            feedback = "${lm://Field/2}";
        } else {
            stim = "${lm://Field/3}";
            feedback = "${lm://Field/4}";
        }
		
        // --- SIMULTANEOUS condition: show previous image ---
        if (presentationGroup === "Simultaneous") {
            prevStim = Qualtrics.SurveyEngine.getEmbeddedData("prevStim");

            if (prevStim && leftImg) {
                leftImg.src = "https://raw.githubusercontent.com/tseabrooke/FalseWebs/main/Training/"
                    + prevStim + ".png?raw=true";
                leftImg.style.visibility = 'visible';

                var lastComment = prevStim.includes("S") ?
                    "This image was <strong>AI-generated</strong>." :
                    "This image was <strong>Human</strong>.";

                if (prevLabel) {
                    jQuery(prevLabel).html(lastComment).show();
                }
            } else {
                if (leftImg) leftImg.style.visibility = 'hidden';
                if (prevLabel) jQuery(prevLabel).hide();
            }
        }

        // --- SUCCESSIVE condition: hide previous image entirely ---
        if (presentationGroup === "Successive") {
            if (leftImg) leftImg.style.visibility = "hidden";
            if (prevLabel) jQuery(prevLabel).hide();
        }

        // --- CURRENT image (shown in all conditions) ---
        if (currImg) {
            currImg.src = "https://raw.githubusercontent.com/tseabrooke/FalseWebs/main/Training/"
                + stim + ".png?raw=true";
        }

        currentCommentDiv.html("What is this image?").show();

        // Hide default Qualtrics feedback
        jQuery(".q-feedback, .ScoreView, .scoring, .scoringResults").hide();
        this.hideNextButton();

        // --- Determine correct indices ---
        var thisImage = stim.includes("S") ? "AI-generated" : "Real";
        var correctIndices = (thisImage === "AI-generated") ? [1, 2, 3] : [4, 5, 6];

        // Feedback placeholder
        var feedbackDiv = jQuery('<div style="text-align:center; font-size:22px; font-weight:bold; margin-top:25%; display:none;"></div>');
        qContainer.append(feedbackDiv);

        // Listen for radio clicks
        qContainer.find('input[type="radio"]').on('click', function () {
            if (hasResponded) return;
            hasResponded = true;

            var index = qContainer.find('input[type="radio"]').index(this) + 1;
            var isCorrect = correctIndices.includes(index);

            // Hide other content
            qContainer.children().not(feedbackDiv).hide();

            // Combine feedback (Correct! or Incorrect!)
            var message = (isCorrect ? "Correct! " : "Incorrect! ") + feedback;

            feedbackDiv
                .text(message)
                .css('color', isCorrect ? 'green' : 'red') //Correct feedback = green, incorrect feedback = red.
                .addClass('feedback')
                .show();

            // Have participants click a button to progress when the feedback is presented.
            jQuery("#NextButton").show();
        });

        // --- Store current stimulus for next trial ---
        Qualtrics.SurveyEngine.setEmbeddedData("prevStim", stim);
    }
});

Qualtrics.SurveyEngine.addOnUnload(function () {
    /*Place your JavaScript here to run when the page is unloaded*/

});