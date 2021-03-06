(function() {
'use strict';

angular.module('eKinerja').controller('DisposisiController', DisposisiController);

function DisposisiController(EkinerjaService, HakAksesService, AmbilDisposisiService, DisposisiService, $scope, 
    $state, $uibModal, $document, PengumpulanDataBebanKerjaService) {
	var vm = this;
	vm.loading = true;
	vm.item = {};
    vm.item.isiDisposisi = "-";

    if($.parseJSON(sessionStorage.getItem('credential')).eselon.split('.')[0].toLowerCase() == 'iv')
        vm.isEselon4 = true;
    else vm.isEselon4 = false;

    if($state.current.name == "perpindahan")
        vm.isCreate = true;

    if($state.params.kdJenis == "")
      vm.isUpload = true;
debugger

	vm.maksud = [{"id": new Date().getTime(), "deskripsi": ''}];
    vm.target = [];

    vm.addMaksud = function(){
          var data = {"id": new Date().getTime(), "deskripsi": ''};
          vm.maksud.push(data);
        }

    vm.addTarget = function(){
      var data = {"id": new Date().getTime()};
      vm.target.push(data);
    }

    $scope.uploadPic = function(files) {
        console.log(files[0].name);
        vm.name = files[0].name;
        vm.extension = files[0].name.split('.');
        vm.extension = vm.extension[vm.extension.length - 1];
        vm.file = files[0];
    }

    function uploadFile(response){
        if($state.params.kdJenis == "" && $state.current.name == "perpindahan"){
            var namaFile = response.message + '.' + vm.extension; debugger;
            var formData = new FormData();
            formData.append('file', vm.file, namaFile);

            DisposisiService.UploadFile(formData).then(
                function(response){debugger
                    EkinerjaService.showToastrSuccess("Disposisi Berhasil Dibuat");
                    $state.go('ambilperpindahan');
                }, function(errResponse){

                })
        } else {
            EkinerjaService.showToastrSuccess("Disposisi Berhasil Dibuat");
            $state.go('ambilperpindahan');
        }
    }

    function uploadTemplate(data) {debugger
        DisposisiService.save(data).then(
            function(response){
                uploadFile(response);
            }, function(errResponse){

            })
    };

    function saveDraft(data) {debugger
        DisposisiService.SaveDraft(data).then(
            function(response){
                uploadFile(response);
                // EkinerjaService.showToastrSuccess("Draft Disposisi Berhasil Dibuat");
                // $state.go('ambilperpindahan');
            }, function(errResponse){

            })
    };

    getAllPegawai();
    function getAllPegawai(){
      DisposisiService.GetPegawaiBawahan($.parseJSON(sessionStorage.getItem('credential')).nipPegawai).then(
        function(response){
          vm.list_pegawai = response;
          // sessionStorage.setItem('pegawai', JSON.stringify(vm.list_pegawai));
		    if($state.current.name == "perpindahandisposisi"){
		    	getDisposisi();
		    	vm.penerusan = true;
		    }else {vm.penerusan = false;
		          }
          vm.loading = false;	
        }, function(errResponse){

        })
    }

    function getDisposisi(){
    	AmbilDisposisiService.GetDokumenDisposisi($state.params.kdSurat).then(
	        function(response){debugger
	          // template(response);
	          vm.item.tktKeamanan = response.tktKeamanan;
	          switch(response.tktKeamanan){
	          	case 1 : vm.item.tktKeamananKet = 'Sangat Rahasia'; break; 
	          	case 2 : vm.item.tktKeamananKet = 'Rahasia'; break; 
	          	case 3 : vm.item.tktKeamananKet = 'Biasa'; break; 
	          }
	          vm.item.tanggalPenerimaanMilis = new Date(response.tanggalPenerimaanMilis);
	          vm.item.noSuratDisposisi = response.noSuratDisposisi;
	          vm.item.tglPenyelesaianMilis = new Date(response.tglPenyelesaianMilis);
	          vm.item.lampiran = response.lampiran;
	          vm.item.ringkasanIsiSuratDisposisi = response.ringkasanIsi;
	          vm.item.isiDisposisi = response.isiDisposisi;
	          vm.item.tanggalSuratDisposisiMilis = new Date(response.tanggalSuratDisposisiMilis);
	          vm.item.nipDari = response.dari;
              vm.item.dariSuratDisposisi = response.dari;
	          // vm.getPegawaiDari(); 
	        }, function(errResponse){

	        })
    }


    vm.getPegawai = function(idx){
      if(vm.target[idx].pegawai.length == 18)
        vm.target[idx].pegawaiTarget = EkinerjaService.findPegawaiByNip(vm.target[idx].pegawai,vm.list_pegawai);
    } 

    vm.getPegawaiDari = function(){
      if(vm.item.nipDari.length == 18)
        vm.item.dariSuratDisposisi = EkinerjaService.findPegawaiByNip(vm.item.nipDari,vm.list_pegawai);
    	console.log(vm.item.dariSuratDisposisi);
    } 

    vm.openPegawai = function (parentSelector) {debugger
        if(vm.isEselon4){
            var template = 'app/template/dataPegawai/dataPegawai.html';
            var ctrl = 'DataPegawaiController';
            var ctrlAs = 'datapegawai';
            var rlv = { pegawai: function(){ return vm.list_pegawai; },
                        pegawaiPilihan: function(){ return vm.target; },
                        isPilihan: function(){ return 0; }
                      }
        } else{
            var template = 'app/template/dataJabatan/dataJabatan.html';
            var ctrl = 'DataJabatanController';
            var ctrlAs = 'datajabatan';
            var rlv = { jabatan: function(){ return vm.list_pegawai; },
                        jabatanPilihan: function(){ return vm.target; },
                        isPilihan: function(){ return 0; }
                      }
        }
        var parentElem = parentSelector ? 
        angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
        var modalInstance = $uibModal.open({
        animation: true,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        templateUrl: template,
        controller: ctrl,
        controllerAs: ctrlAs,
        // windowClass: 'app-modal-window',
        size: 'lg',
        appendTo: parentElem,
        resolve: rlv
        });

        modalInstance.result.then(function () {
        }, function () {

        });
      };

      vm.openPilihan = function (parentSelector) {  
        if(vm.isEselon4){
            var template = 'app/template/dataPegawai/dataPegawai.html';
            var ctrl = 'DataPegawaiController';
            var ctrlAs = 'datapegawai';
            var rlv = { pegawai: function(){ return vm.target; },
                        pegawaiPilihan: function(){ return vm.target; },
                        isPilihan: function(){ return 1; }
                      }
        } else{
            var template = 'app/template/dataJabatan/dataJabatan.html';
            var ctrl = 'DataJabatanController';
            var ctrlAs = 'datajabatan';
            var rlv = { jabatan: function(){ return vm.target; },
                        jabatanPilihan: function(){ return vm.target; },
                        isPilihan: function(){ return 1; }
                      }
        }
        var parentElem = parentSelector ? 
        angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
        var modalInstance = $uibModal.open({
        animation: true,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        templateUrl: template,
        controller: ctrl,
        controllerAs: ctrlAs,
        // windowClass: 'app-modal-window',
        size: 'lg',
        appendTo: parentElem,
        resolve: rlv
        });

        modalInstance.result.then(function () {
        }, function () {

        });
      };

      vm.openDari = function (parentSelector) {
        var parentElem = parentSelector ? 
        angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
        var modalInstance = $uibModal.open({
        animation: true,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        templateUrl: 'app/template/dataPegawai/dataPegawai.html',
        controller: 'DataPegawaiController',
        controllerAs: 'datapegawai',
        // windowClass: 'app-modal-window',
        size: 'lg',
        appendTo: parentElem,
        resolve: {
        	pegawai: function(){
        		return vm.list_pegawai;
        	},
        	pegawaiPilihan: function(){
        		return vm.item.dariSuratDisposisi;
        	},
        	isPilihan: function(){
        		return 2;
        	}
        }
        });

        modalInstance.result.then(function (data) {
        	vm.item.dariSuratDisposisi = data;
        }, function () {

        });
      };

    vm.save = function(){
      var data = {
        "tktKeamanan": vm.item.tktKeamanan,
        "tanggalPenerimaanMilis": vm.item.tanggalPenerimaanMilis.getTime(),
        "kdLembarDisposisiParent": "",
        "noSuratDisposisi": vm.item.noSuratDisposisi,
        "tglPenyelesaianMilis": null,
        "lampiran": vm.item.lampiran,
        "dariSuratDisposisi": vm.item.dariSuratDisposisi,
        "ringkasanIsiSuratDisposisi": vm.item.ringkasanIsiSuratDisposisi,
        "tanggalSuratDisposisiMilis": (new Date()).getTime(),
        "nipPembuat": $.parseJSON(sessionStorage.getItem('credential')).nipPegawai,
        "daftarTargetLembarDisposisi": [],
        "kdUnitKerja": $.parseJSON(sessionStorage.getItem('credential')).kdUnitKerja,
        "isiDisposisi": vm.item.isiDisposisi,
        "durasiPengerjaan": vm.item.durasiPengerjaan
    };

    if($state.current.name == "perpindahan"){
        data.kdUrtug = $state.params.kdUrtug;
        data.tahun = $state.params.tahun;
        data.tanggalSuratDisposisiDiterimaMilis = vm.item.tanggalPenerimaanMilis.getTime();
    	data.kdLembarDisposisiParent = null;
        vm.target.push({nama: '-',jabatan: '-'});
        if($state.params.kdJenis == "")
            data.namaFileSuratLain = vm.name;
        else {
            data.jenisSuratPenugasan = $state.params.kdJenis;
            data.kdSuratPenugasan = $state.params.kdSurat;
        }
    }else{
        data.kdLembarDisposisiParent = $state.params.kdSurat;
    }

    for(var i = 0; i < vm.target.length; i++)
      if(vm.isEselon4){
        data.daftarTargetLembarDisposisi.push(vm.target[i].nipPegawai);
        data.isTargetJabatan = false;
      }
      else {
        data.daftarTargetLembarDisposisi.push(vm.target[i].kdJabatan);
        data.isTargetJabatan = true;
      }
      console.log(data);

    // console.log(data);
      if($state.current.name == "perpindahan")
        saveDraft(data);
      else uploadTemplate(data);
      // DisposisiService.save(data).then(
      //   function(response){
      //     EkinerjaService.showToastrSuccess('Data Berhasil Disimpan');
      //       $state.go('ambilperpindahan');
      //   }, function(errResponse){
      //         EkinerjaService.showToastrError('Data Tidak Dapat Disimpan');
      //   });
    }
    
    // vm.save = function(){
    // 	$state.go('perpindahan');
    // } 
    vm.back =  function(){
      $state.go('ambilperpindahan');
    }

    function template(){
        if($state.current.name == "perpindahan")
            var unitTarget = $.parseJSON(sessionStorage.getItem('credential')).unit.toUpperCase();
        else var unitTarget = vm.target[0].unitKerja.toUpperCase();
    	vm.docDefinition = {
    		pageSize: 'A4',
    		content: [
                {
                    table:{
                        widths: ['50%', '*', '20%'],
                        body:[
                            [
                                {
                                    border: [true, true, true, false],
                                    text: [
                                        {text: 'PEMERINTAH KABUPATEN BEKASI\n',style: 'header'},
                                        {text: '' + unitTarget,style: 'header'}
                                    ],
                                    colSpan: 3
                                }, {}, {}
                            ],
                            [
                                {
                                    border: [true, false, true, false],
                                    stack:[
                                        {text: 'Komplek Perkantoran Pemerintah Kabupaten Bekasi Desa Sukamahi Kecamatan Cikarang Pusat',style: 'header3'}
                                    ],
                                    margin: [130, 0, 130, 0],
                                    colSpan: 3
                                },{},{}
                            ],
                            [
                                {
                                    border: [true, false, true, false],
                                    stack:[
                                        {
                                            columns: [
                                                {width: '25%', text: 'Telp. (021) 89970696',style:'header3'},
                                                {width: '25%',text: 'Fax. (021) 89970064',style:'header3'},
                                                {width: '40%',text: 'email : diskominfo@bekasikab.go.id',style:'header3'}
                                            ]
                                        }
                                    ],
                                    margin: [70, 0, 10, 0],
                                    colSpan: 3
                                },{},{}
                            ],
                            [
                                {
                                    text: [
                                        {text: 'LEMBAR DISPOSISI',style: 'header'}
                                    ],
                                    colSpan: 3
                                }, {}, {}
                            ],
                            [
                                {
                                    text: [
                                        {text: 'Nomor Agenda/Registrasi : ', fontSize: 10},
                                        {text: ' ', fontSize: 10,bold: true}
                                    ]
                                },
                                {
                                    text: [
                                        {text: 'Sifat Disposisi : ', fontSize: 10},
                                        {text: [''], fontSize: 10, bold: true}
                                    ]
                                    ,colSpan: 2
                                },{}
                            ],
                            [
                                {
                                    text: [
                                        {text: 'Tanggal Penerimaan : ', fontSize: 10},
                                        {text: '' + EkinerjaService.IndonesianDateFormat(vm.item.tanggalPenerimaanMilis), fontSize: 10, bold: true}
                                    ]
                                },
                                {
                                    text: [
                                        {text: 'Tanggal Penyelesaian : ', fontSize: 10},
                                        {text: '' + EkinerjaService.IndonesianDateFormat(vm.item.tglPenyelesaianMilis), fontSize: 10, bold: true}
                                    ]
                                    ,colSpan: 2
                                },{}
                            ],
                            [
                                {
                                    fontSize: 10,
                                    table: {
                                        widths: [120, 5, '*'],
                                        body: [
                                            ['Tanggal dan Nomor Surat', ':',
                                                {
                                                    text: [
                                                        {text: '' + EkinerjaService.IndonesianDateFormat(vm.item.tanggalSuratDisposisiMilis), bold: true},
                                                        {text: ' dan '},
                                                        {text: '' + vm.item.noSuratDisposisi, bold: true}
                                                    ]
                                                }
                                            ],
                                            ['Dari', ':', {text: '' + vm.item.dariSuratDisposisi, bold: true}],
                                            ['Perihal', ':', {text: '' + vm.item.ringkasanIsiSuratDisposisi, bold: true}],
                                            ['Lampiran', ':', {text: '' + vm.item.lampiran, bold: true}]
                                        ]
                                    },colSpan: 3, layout: 'noBorders'
                                },{},{}
                            ],
                            [
                                {
                                    text: 'ISI DISPOSISI',
                                    style: 'header4',
                                    alignment: 'center'
                                },
                                {
                                    text: 'DITERUSKAN KEPADA',
                                    style: 'header4',
                                    alignment: 'center',
                                    colSpan: 2
                                }
                            ],
                            [
                                {
                                    style: 'header5',
                                    alignment: 'justify',
                                    text: '' + vm.item.isiDisposisi
                                },
                                {
                                    style: 'header5',
                                    ol: [],
                                    colSpan: 2
                                }
                            ]
                        ]
                    }
                }
    		],
    		styles: {
                header: {
                    bold: true,
                    fontSize: 14,
                    alignment: 'center'
                },
                header2: {
                    fontSize: 12,
                    alignment: 'center'
                },
                header3: {
                    fontSize: 10,
                    alignment: 'center'
                },
                nama_judul: {
                    alignment : 'center',
                    bold: true,
                    fontSize: 12
                },
                judul_nomor: {
                    alignment : 'center',
                    bold: true,
                    fontSize: 12
                },
                demoTable: {
                    color: '#000',
                    fontSize: 12
                },
                tandaTangan: {
                    color: '#000',
                    fontSize: 12,
                    alignment:'right'
                },
                header4: {
                    bold: true,
                    fontSize: 12
                },
                header5: {
                    fontSize: 12
                }
		      }
		  };

			if (vm.item.tktKeamanan == 1) {
				vm.docDefinition.content[0].table.body[4][1].text[1].text[0] += "Sangat Rahasia";
			}
			else if (vm.item.tktKeamanan == 2) {
				vm.docDefinition.content[0].table.body[4][1].text[1].text[0] += "Rahasia";
			}
			else if (vm.item.tktKeamanan == 3) {
				vm.docDefinition.content[0].table.body[4][1].text[1].text[0] += "Biasa";
			}

	    	for(var i = 0; i < vm.target.length; i++){
                if(vm.isEselon4)
	               vm.docDefinition.content[0].table.body[8][1].ol.push(vm.target[i].nama);
                else vm.docDefinition.content[0].table.body[8][1].ol.push(vm.target[i].jabatan);
	        }
    	};


        $scope.openPdf = function() {
          var blb;
          // pdfMake.createPdf(vm.docDefinition).getBuffer(function(buffer) {
          //     // turn buffer into blob
          //     blb = buffer;
          // });
          // blb = new Blob(blb);
          console.log(vm.item.pembukaSurat);
          template();
          EkinerjaService.lihatPdf(vm.docDefinition, 'Disposisi');
        };

        $scope.downloadPdf = function() {
          pdfMake.createPdf(vm.docDefinition).download();
        };
    }

})();