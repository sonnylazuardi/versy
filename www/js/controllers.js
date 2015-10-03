angular.module('starter.controllers', [])

.factory("Auth", function($firebaseAuth, FBURL) {
  var ref = new Firebase(FBURL);
  return $firebaseAuth(ref);
})

.controller('DashCtrl', function($scope) {})

.controller('BrowseCtrl', function($scope,FBURL) {
    var ref = new Firebase(FBURL+"/images/");
        ref.on("value", function(snapshot) { //async
            console.log(snapshot.val());
            $scope.images=snapshot.val();
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });

})

.controller('LoginCtrl', function($scope, $state,FBURL) {
  $scope.facebook = function() {
    var ref = new Firebase(FBURL);
    ref.authWithOAuthPopup("facebook", function(error, authData) {
      if (error) {
        console.log("Login Failed!", error);
      } else {
        localStorage.setItem("authData",JSON.stringify(authData));
        console.log("Authenticated successfully with payload:", authData);
        ref.child("users").child(authData.uid).set({
            id:authData.uid,
            name: authData.facebook.displayName,
            email: authData.facebook.email,
            avatar: authData.facebook.cachedUserProfile.picture.data.url
        });
        $state.go('tab.create');
      }
    },{
        scope:"public_profile, email, user_friends"
    });
  }
  $scope.password = function() {
    var ref = new Firebase("https://versy.firebaseio.com");
    var email=document.getElementById("email").value;
    var password=document.getElementById("password").value;
    ref.createUser({
      email    : email,
      password : password
    }, function(error, userData) {
      if (error) {
        console.log(error);
      } else {
        console.log("Successfully created user account with uid:", userData);
        ref.child("users").child(userData.uid).set({
            id:userData.uid,
            email    : email
        });
      }
        ref.authWithPassword({
            email    : email,
            password : password
        }, function(error, authData) {
          if (error) {
            console.log("Login Failed!", error);
          } else {
            localStorage.setItem("authData",JSON.stringify(authData));
            console.log("Authenticated successfully with payload:", authData);
             $state.go('tab.create');
          }
        });
    });
  }
})

.controller('TimelineCtrl', function($scope, $stateParams) {

})

.controller('AccountCtrl', function($scope) {

})


.controller('DetailCtrl', function($scope, $stateParams,$http,FBURL) {
    var ref = new Firebase(FBURL+"/images/"+$stateParams.id);
    ref.on("value", function(snapshot) { //async
      $scope.devo =snapshot.val();
    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
    });
    
    $scope.comment = function(cText,image_id) {
        var authData=JSON.parse(localStorage.getItem("authData"));
        var comment = {
                text: cText,
         };
         console.log(authData.provider);
         if (authData.provider=="facebook"){
            comment.user_name=authData.facebook.displayName;
            comment.user_pp=authData.facebook.cachedUserProfile.picture.data.url;
         }
         else{
            comment.user_name="dummyUse";
            comment.user_pp="dummy.png";
         }
        $http({
            url:"https://versy.firebaseio.com/images/"+image_id+"/comments.json",
            method:'POST',
            data:comment,
            headers:{'Content-Type':'application/json','X-Requested-With': 'XMLHttpRequest'}
        }).success(function (res) {})
        .error(function (reponse) {});
    };
    /*$http({
            url:'http://versy.firebaseio.com/images/1',
            method:'GET',
            headers:{'Content-Type':'application/json'}
        }).success(function (res) {
            console.log(res);
            var devo = {
                verse: $scope.devo.verse,
                content: $scope.devo.content,
                scripture: $scope.devo.scripture,
                image: res,
                user: 1
            };

        })
        .error(function (reponse) {
            console.log(response);
        });*/
})


.controller('CreateCtrl', function($scope, $stateParams, $state, Fabric, FabricConstants, Keypress, $timeout, $cordovaCamera, $ionicModal, $http, $q, Devo) {
    $scope.view = {
        loading: false
    };
    $scope.devo = {
        verse: 'Psalm 19:1',
        font: 'Lobster',
        content: 'The heavens declare \n the glory of God',
        scripture: 'Psalm 19:1 - The heavens declare the glory of God; and the firmament sheweth his handywork.',
    };

    $scope.next = function() {
        $scope.save();
        $state.go('tab.create2');
    };

    $scope.save = function() {
        Devo.setDevo($scope.devo);
    };

    Keypress.onSave(function() {
        $scope.updatePage();
    });
})

.controller('Create2Ctrl', function($scope, $stateParams, $state, Fabric, FabricConstants, Keypress, $timeout, $cordovaCamera, $ionicModal, $http, $q, Devo) {
    $scope.fabric = {};
    $scope.FabricConstants = FabricConstants;

    $scope.prev = function() {
        $state.go('tab.create');
    }

    $scope.next = function() {
        $scope.save();
        $state.go('tab.create3');
    }

    $ionicModal.fromTemplateUrl('templates/modal-bg.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
        $scope.modal.show();
    })  

    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });

    $scope.placeText = function() {
        $scope.fabric.addCustomText($scope.devo.content, 180, 38);
        $scope.fabric.addCustomText($scope.devo.verse, 290, 28);
    };

    $scope.actions = {
        selectImage: function() {
            $scope.modal.show();
        },
        selectBg: function(imageUrl) {
            $scope.clearCanvas();
            $scope.fabric.addImage(imageUrl).then(function() {
                $scope.placeText();
            });
            $scope.modal.hide();
        },
        captureImage: function() {
            var options = {
                quality: 90,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.CAMERA,
                allowEdit: true,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 360,
                targetHeight: 360,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: false,
                correctOrientation:true
            };

            $scope.clearCanvas();

            $cordovaCamera.getPicture(options).then(function(imageData) {
              // var image = document.getElementById('myImage');
              // image.src = "data:image/jpeg;base64," + imageData;
              $scope.fabric.addImage("data:image/jpeg;base64," + imageData).then(function() {
                $scope.placeText();
              });
            }, function(err) {
              // error
            });
        },
    };

    $scope.closeModal = function() {
        $scope.modal.hide();
    };

    $scope.clearCanvas = function() {
        $scope.fabric.clearCanvas(); $scope.fabric.setDirty(true);
    };

    $scope.addImageUpload = function(data) {
        var obj = angular.fromJson(data);
        $scope.addImage(obj.filename);
    };

    $scope.changeFont = function() {
        $scope.fabric.deactivateAll();
    };

    $scope.canvas = {
        image: ''
    };
    //
    // Editing Canvas Size
    // ================================================================
    $scope.selectCanvas = function() {
        $scope.canvasCopy = {
            width: $scope.fabric.canvasOriginalWidth,
            height: $scope.fabric.canvasOriginalHeight
        };
    };

    $scope.setCanvasSize = function() {
        $scope.fabric.setCanvasSize($scope.canvasCopy.width, $scope.canvasCopy.height);
        $scope.fabric.setDirty(true);
        delete $scope.canvasCopy;
    };

    //
    // Init
    // ================================================================
    $scope.init = function() {
        $scope.fabric = new Fabric({
            JSONExportProperties: FabricConstants.JSONExportProperties,
            textDefaults: FabricConstants.textDefaults,
            shapeDefaults: FabricConstants.shapeDefaults,
            json: {}
        });

        $scope.placeText();
    };


    $scope.load = function() {
        $scope.devo = Devo.getDevo();
    };
    $scope.load();

    $scope.save = function() {
        $http({
            url:'http://busintime.id:5001/versy/upload',
            method:'POST',
            data:JSON.stringify({file: $scope.fabric.getImageData()}),
            headers:{'Content-Type':'application/json'}
        }).success(function (res) {
            var devo = {
                verse: $scope.devo.verse,
                content: $scope.devo.content,
                scripture: $scope.devo.scripture,
                image: res,
                user: 1
            };
            $http.post('https://versy.firebaseio.com/images.json', devo).success(function (result) {
                $scope.devo.id = result.name;
                Devo.setDevo($scope.devo);
                $http.put('https://versy.firebaseio.com/users/1/images/'+$scope.devo.id+'.json', $scope.devo).success(function (result) {

                });
            });

        })
        .error(function (reponse) {
            console.log(response);
        });
    };

    $scope.$on('canvas:created', $scope.init);
})

.controller('Create3Ctrl', function($scope, $stateParams, $state, Fabric, FabricConstants, Keypress, $timeout, $cordovaCamera, $ionicModal, $http, $q, Devo) {
    $scope.prev = function() {
        $state.go('tab.create2');
    }

    $scope.devo = {};
    $scope.load = function() {
        $scope.devo = Devo.getDevo();
    };
    $scope.load();

    $scope.save = function() {
        var devo = {
            scripture: $scope.devo.scripture,
            observation: $scope.devo.observation,
            application: $scope.devo.application,
            prayer: $scope.devo.prayer,
            user: 1,
        };

        $http.patch('https://versy.firebaseio.com/images/'+$scope.devo.id+'.json', devo).success(function (result) {
            console.log(result);
            $state.go('timeline');
        });
    }
})

.controller('CardCtrl', function($scope, TDCardDelegate) {
  $scope.cardSwipedLeft = function(index) {
    console.log('LEFT SWIPE');
    $scope.addCard();
  };
  $scope.cardSwipedRight = function(index) {
    console.log('RIGHT SWIPE');
    $scope.addCard();
  };
});;
