angular.module('starter.controllers', [])

.factory("Auth", function($firebaseAuth, FBURL) {
  var ref = new Firebase(FBURL);
  return $firebaseAuth(ref);
})

.controller('DashCtrl', function($scope) {})

.controller('BrowseCtrl', function($scope) {
  

})

.controller('LoginCtrl', function($scope, $state,FBURL) {
  $scope.facebook = function() {
    var ref = new Firebase(FBURL);
    ref.authWithOAuthPopup("facebook", function(error, authData) {
      if (error) {
        console.log("Login Failed!", error);
      } else {
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

.controller('Create2Ctrl', function($scope, $state) {
    $scope.devo = {
        verse: 'Psalm 19:1',
        font: 'Lobster',
        content: 'The heavens declare \n the glory of God',
        scripture: 'Psalm 19:1 - The heavens declare the glory of God; and the firmament sheweth his handywork.',
    };


})

.controller('CreateCtrl', function($scope, $stateParams, $state, Fabric, FabricConstants, Keypress, $timeout, $cordovaCamera, $ionicModal, $http) {
    $scope.fabric = {};
    $scope.FabricConstants = FabricConstants;
    $scope.message = '';
    $scope.view = {
        loading: false
    };
    $scope.devo = {
        verse: 'Psalm 19:1',
        font: 'Lobster',
        content: 'The heavens declare \n the glory of God',
        scripture: 'Psalm 19:1 - The heavens declare the glory of God; and the firmament sheweth his handywork.',
    };

    //
    // Creating Canvas Objects
    // ================================================================
    $scope.addShape = function(path) {
        return $scope.fabric.addShape('img/takut.svg');
    };

    $scope.addImage = function(image) {
        return $scope.fabric.addImage('imgdata.php?url=http://graph.facebook.com/'+$scope.fbid+'/picture?type=square|width=450|height=450');
    };

    $ionicModal.fromTemplateUrl('templates/modal-bg.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    })  

    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });

    $scope.$on('modal.hidden', function() {
        alert('hidden');
    });

    $scope.actions = {
        selectImage: function() {
            $scope.modal.show();
        },
        selectBg: function(imageUrl) {
            $scope.clearCanvas();
            $scope.fabric.addImage(imageUrl).then(function() {
                $scope.fabric.addCustomText($scope.devo.verse, 130, 10);
                $scope.fabric.addCustomText($scope.devo.content, 70, 15);
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
                $scope.fabric.addCustomText($scope.devo.verse, 130, 10);
                $scope.fabric.addCustomText($scope.devo.content, 70, 15);
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

    $scope.canvas = {
        image: ''
    };

    $scope.save = function() {
        var devo = {
            verse: $scope.devo.verse,
            content: $scope.devo.content,
            scripture: $scope.devo.scripture,
            image: $scope
        };

        $http({
            url:'http://busintime.id:5001/versy/upload',
            method:'POST',
            data:JSON.stringify({file: $scope.fabric.getImageData()}),
            headers:{'Content-Type':'application/json'}
        }).success(function (res) {
            var devo = {
                verse: $scope.devo.verse,
                content: $scope.devo.content,
                scripture: $scope.devo.verse + ' - ' + $scope.devo.content,
                image: res
            };

            $http.post('https://versy.firebaseio.com/images/.json', devo).then(function(result) {
                console.log(result);
            });
        })
        .error(function (reponse) {
            console.log(response);
        });
        
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
        $scope.fabric.addCustomText($scope.devo.verse, 130, 10);
        $scope.fabric.addCustomText($scope.devo.content, 70, 15);
        // $scope.addImage().then(function(object) {
        //     $scope.addShape().then(function(object) {
        //         $timeout(function() {
        //             $scope.fabric.addCustomText('Izin Bertakut', 70, 20);
        //         }, 500);
        //         $timeout(function() {
        //             $scope.message = $scope.fabric.addCustomText('Karena '+$scope.name+'\n...', 100, 12);
        //         }, 600);
        //     });
        // });
    };

    $scope.next = function() {
        $scope.save();
        $state.go('tab.create2');
    };

    $scope.$on('canvas:created', $scope.init);

    Keypress.onSave(function() {
        $scope.updatePage();
    });
})

;
