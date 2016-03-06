Polls = new Meteor.Collection("Polls");
Votes = new Meteor.Collection("Votes");
var secenekSay = 4;
var newOptionNeeded = false;
var anketID;
isChartRender = false;
data = new ReactiveArray();
Router.route("/", {
    template: 'homeTemplate'

});
Router.route("/vote/:id", {
    name: 'poll.vote',
    template: 'voteTemplate',
    data: {
        anket: function () {

            return Polls.findOne({ _id: anketID });
        },
        secenekler: function () {
            return Votes.find({ pollId: anketID });
        }


    },

    onBeforeAction : function(){
        $('#modal1').closeModal();
        this.next();
    },

    action: function () {
        anketID = this.params.id
        this.render();
    }
})

Router.route("/result/:id", {
    name: "poll.result",
    template: "resultTemplate",
    data: {
        anket: function () {

            return Polls.findOne({ _id: anketID });
        },
        secenekler: function () {
            return Votes.find({ pollId: anketID });
        }
    },
    action: function () {
        anketID = this.params.id
        this.render();


    },
    onAfterAction: function () {

    }

});

Router.route("/test", {
    template: "testTemplate"
})
if (Meteor.isClient) {
    builtPie = function () {
        data.clear();
        var colors = [{ color: "#F7464A", highlight: "#FF5A5E", },
              {
                  color: "#46BFBD", highlight: "#5AD3D1",
              }, {
                  color: "#FDB45C", highlight: "#FFC870"
              }];
        var i = 0;
        Votes.find({ pollId: anketID }).forEach(function (vote) {

            data.push(
                {
                    y: vote.voteRate,
                    name: vote.optionText,
                    color: colors[i % 3].color,

                });
            i++;
        });
        $('#grafik').highcharts({

            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                animation: false
            },

            title: {
                text: ''
            },

            credits: {
                enabled: false
            },

            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },

            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    animation: false,
                    dataLabels: {
                        enabled: false
                    },
                    showInLegend: true
                }
            },

            series: [{
                type: 'pie',
                name: 'Result',
                data: data
            }]
        });
    };


    yaz = function (id) {
        if (id == secenekSay) {
            secenekSay++;
           
            var yeni = '<div class="input-field"> <i class="material-icons prefix" style="font-size:1.5em">add</i><input type="text" onkeypress="yaz(' + secenekSay + ');" name="option" id="option' + secenekSay + '"><label for="option' + secenekSay + '">' + secenekSay + ')  Enter poll option...</label> </div>'
            $("div.inputContent").append(yeni);
        }



    }

    nullCheck = function (data) {
        return (data === "");
    }



    Template.homeTemplate.events({
        "submit form": function (e, tmpl) {
            e.preventDefault();
            var question = tmpl.find("#question").value;
            var optionGroup = document.forms["pollForm"].elements["option"];
            var isFull = optionGroup.length;
            for (var i = 0; i < optionGroup.length; i++) {
                if (nullCheck(optionGroup[i].value)) isFull--;
            }

            if (nullCheck(question)) {
                alert("Question Required");
                return false;
            }
            if (isFull < 2) {
                alert("Minumum 2 Opiton Required");
                return false;
            }
            var PollID = Polls.insert({
                title: question

            });
            var optionsArray = [];
            var j = 0;
            for (i = 0; i < optionGroup.length; i++) {
                if (!nullCheck(optionGroup[i].value)) {
                    Votes.insert({
                        pollId: PollID,
                        optionText: optionGroup[i].value,
                        voteRate: 0

                    });
                }
            }

            $("#link").html("<a href='/vote/" + PollID + "'> Go To Poll </a>");
            $('#modal1').openModal();


        }
    });

    Template.voteTemplate.events({

        "submit form": function (e) {
            e.preventDefault();
            var cboxes = document.getElementsByName('option');
            var len = cboxes.length;
            var oy = 0;
            for (var i = 0; i < len; i++) {

                if (cboxes[i].checked) {
                    oy++;
                    var optionID = cboxes[i].value;
                    Votes.update({ _id: optionID }, { $inc: { "voteRate": 1 } });


                }
            }
            if (oy == 0) {
                Materialize.toast('Please select at least 1 pick', 3000);
            }
            else
                Materialize.toast('Voted!', 2000)

        }
    });



    Template.resultTemplate.rendered = function () {
        this.autorun(function (c) {
            builtPie();
        })



    }


}
Meteor.methods({
    "incVote": function (optionID) {
        //  alert(optionID + " calisti");
        // Polls.update({ _id: id, "options.no": no }, { $inc: { "options.$.voteRate": 1 } });
        Votes.update({ _id: optionID }, { $inc: { "voteRate": 1 } });
        return true;
    }
});
if (Meteor.isServer) {




    Meteor.startup(function () {

    });
}
