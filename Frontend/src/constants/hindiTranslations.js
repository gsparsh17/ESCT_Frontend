export const HINDI_TRANSLATIONS = {
  STEP_TITLES: [
    'खाता विवरण',
    'व्यक्तिगत विवरण',
    'रोजगार / बैंक विवरण',
    'नामांकित व्यक्ति विवरण'
  ],

  LABELS: {
    state: 'राज्य',
    userType: 'उपयोगकर्ता प्रकार',
    employee: 'कर्मचारी',
    pensioner: 'पेंशनभोगी',
    ehrmsCode: 'ईएचआरएमएस कोड',
    pensionerNumber: 'पेंशनभोगी संख्या',
    password: 'पासवर्ड',
    confirmPassword: 'पासवर्ड की पुष्टि करें',
    fullName: 'पूरा नाम',
    dateOfBirth: 'जन्म तिथि',
    sex: 'लिंग',
    male: 'पुरुष',
    female: 'महिला',
    other: 'अन्य',
    aadhaarNumber: 'आधार संख्या',
    phone: 'फोन नंबर',
    email: 'ईमेल',
    profilePhoto: 'प्रोफाइल फोटो',
    aadhaarFront: 'आधार सामने की तरफ',
    aadhaarBack: 'आधार पीछे की तरफ',
    upload: 'अपलोड करें',
    optional: 'वैकल्पिक',
    required: 'आवश्यक',
    district: 'जिला',
    department: 'विभाग',
    organisation: 'संगठन',
    designation: 'पदनाम',
    dateOfJoining: 'कार्यग्रहण की तिथि',
    dateOfRetirement: 'सेवानिवृत्ति की तिथि',
    retirementDocument: 'सेवानिवृत्ति दस्तावेज़',
    accountNumber: 'खाता संख्या',
    confirmAccountNumber: 'खाता संख्या की पुष्टि करें',
    ifscCode: 'आईएफएससी कोड',
    bankName: 'बैंक का नाम',
    branchName: 'शाखा का नाम',
    nomineeName: 'नामांकित व्यक्ति का नाम',
    relation: 'संबंध',
    primaryNominee: 'प्राथमिक नामांकित व्यक्ति',
    addNominee: 'नामांकित व्यक्ति जोड़ें',
    remove: 'हटाएं',
    next: 'अगला',
    back: 'पिछला',
    completeRegistration: 'पंजीकरण पूरा करें',
    registering: 'पंजीकरण हो रहा है...',
    newUserRegistration: 'नए उपयोगकर्ता का पंजीकरण',
    step: 'चरण',
    of: 'का',
    selectState: 'राज्य चुनें',
    selectDistrict: 'जिला चुनें',
    selectDepartment: 'विभाग चुनें',
    selectOrganisation: 'संगठन चुनें',
    selectRelation: 'संबंध चुनें',
    loadingStates: 'राज्य लोड हो रहे हैं...',
    loadingCities: 'शहर लोड हो रहे हैं...',
    noStatesFound: 'कोई राज्य नहीं मिला',
    noCitiesFound: 'कोई शहर नहीं मिला',
    employmentDetails: 'रोजगार विवरण',
    retirementDetails: 'सेवानिवृत्ति विवरण',
    bankDetails: 'बैंक विवरण',
    nomineeBankDetails: 'नामांकित व्यक्ति बैंक विवरण',
    jpegPng: 'JPEG या PNG',
    jpegPngPdf: 'JPEG, PNG, या PDF'
  },

  RELATION_OPTIONS: [
    'पति/पत्नी',
    'बेटा',
    'बेटी',
    'पिता',
    'माता',
    'भाई',
    'बहन',
    'अन्य'
  ],

  PLACEHOLDERS: {
    enterEhrmsCode: 'ईएचआरएमएस कोड दर्ज करें',
    enterPensionerNumber: 'पेंशनभोगी संख्या दर्ज करें',
    min8Characters: 'न्यूनतम 8 वर्ण',
    confirmYourPassword: 'अपने पासवर्ड की पुष्टि करें',
    enterFullName: 'अपना पूरा नाम दर्ज करें',
    twelveDigits: '12 अंक',
    tenDigits: '10 अंक',
    youExampleCom: 'you@example.com',
    enterDesignation: 'पदनाम दर्ज करें',
    enterBankName: 'बैंक का नाम दर्ज करें',
    nomineeFullName: 'नामांकित व्यक्ति का पूरा नाम',
    enterBranchName: 'शाखा का नाम दर्ज करें',
    ifscPlaceholder: 'ABCD0EFGHIJ'
  },

  ERRORS: {
    empStateRequired: 'रोजगार राज्य आवश्यक है।',
    ehrmsCodeRequired: 'ईएचआरएमएस कोड आवश्यक है।',
    pensionerNumberRequired: 'पेंशनभोगी संख्या आवश्यक है।',
    passwordRequired: 'पासवर्ड आवश्यक है।',
    confirmPasswordRequired: 'कृपया अपने पासवर्ड की पुष्टि करें।',
    passwordsNotMatch: 'पासवर्ड मेल नहीं खाते।',
    fullNameMinLength: 'पूरा नाम कम से कम 2 वर्ण का होना चाहिए।',
    invalidDob: 'अमान्य जन्म तिथि। 18-120 वर्ष के बीच होना चाहिए।',
    aadhaarInvalid: 'आधार 12 अंकों का होना चाहिए।',
    phoneInvalid: 'फोन 10 अंकों का होना चाहिए जो 6–9 से शुरू हो।',
    emailInvalid: 'अमान्य ईमेल प्रारूप।',
    empDistrictInvalid: 'रोजगार जिला मान्य होना चाहिए।',
    empOrganisationInvalid: 'रोजगार संगठन मान्य होना चाहिए।',
    empDepartmentInvalid: 'रोजगार विभाग मान्य होना चाहिए।',
    empDesignationInvalid: 'रोजगार पदनाम मान्य होना चाहिए।',
    dateOfRetirementRequired: 'सेवानिवृत्ति की तिथि आवश्यक है।',
    accountNumberMinLength: 'खाता संख्या कम से कम 8 अंकों की होनी चाहिए।',
    accountNumbersNotMatch: 'खाता संख्याएं मेल नहीं खातीं।',
    bankNameInvalid: 'बैंक का नाम मान्य होना चाहिए।',
    ifscInvalid: 'अमान्य आईएफएससी कोड (उदाहरण: ABCD0EFGHIJ)।',
    nomineeNameRequired: 'नामांकित व्यक्ति का नाम आवश्यक है।',
    nomineeRelationRequired: 'नामांकित व्यक्ति का संबंध आवश्यक है।',
    nomineeDobRequired: 'नामांकित व्यक्ति की जन्म तिथि आवश्यक है।',
    nomineeAadhaarInvalid: 'नामांकित व्यक्ति का आधार 12 अंकों का होना चाहिए।',
    nomineeAccountRequired: 'नामांकित व्यक्ति के लिए खाता संख्या आवश्यक है।',
    nomineeConfirmAccountNotMatch: 'खाता संख्याएं मेल नहीं खातीं।',
    nomineeBankNameRequired: 'नामांकित व्यक्ति के लिए बैंक का नाम आवश्यक है।',
    nomineeIfscInvalid: 'अमान्य आईएफएससी कोड।',
    registrationFailed: 'पंजीकरण विफल। कृपया पुनः प्रयास करें।'
  },

  FILE_UPLOAD: {
    uploadProfilePhoto: 'प्रोफाइल फोटो अपलोड करें',
    uploadAadhaarFront: 'आधार सामने की तरफ अपलोड करें',
    uploadAadhaarBack: 'आधार पीछे की तरफ अपलोड करें',
    uploadRetirementDocument: 'सेवानिवृत्ति दस्तावेज़ अपलोड करें',
    nomineeAadhaarFront: 'नामांकित व्यक्ति आधार सामने',
    nomineeAadhaarBack: 'नामांकित व्यक्ति आधार पीछे',
    max5MB: 'अधिकतम 5MB',
    jpegPngMax5MB: 'JPEG या PNG, अधिकतम 5MB',
    jpegPngPdfMax5MB: 'JPEG, PNG, या PDF, अधिकतम 5MB'
  },

  MESSAGES: {
    youCanAddNominees: 'आप नामांकित व्यक्ति जोड़ सकते हैं (वैकल्पिक)।',
    noStatesFoundCheckApi: 'कोई राज्य नहीं मिला (API कुंजी जांचें)',
    selectDistrictCity: 'जिला/शहर चुनें',
    selectDepartment: '-- विभाग चुनें --',
    selectOrganisation: '-- संगठन चुनें --'
  },

  // Add this to your existing hindiTranslations.js file
NAVBAR: {
  totalMembers: 'कुल सदस्य',
  language: 'भाषा',
  links: {
    home: 'होम',
    about: 'हमारे बारे में',
    claims: 'दावे',
    profile: 'प्रोफाइल',
    donationQueue: 'दान कतार',
    admin: 'व्यवस्थापक',
    logout: 'लॉगआउट',
    register: 'पंजीकरण',
    login: 'लॉगिन'
  },
  userTypes: {
    employee: 'कर्मचारी',
    pensioner: 'पेंशनभोगी'
  },
  fields: {
    fullName: 'पूरा नाम',
    dateOfBirth: 'जन्म तिथि',
    gender: 'लिंग',
    phone: 'फोन नंबर',
    email: 'ईमेल',
    aadhaar: 'आधार संख्या',
    empState: 'रोजगार राज्य',
    empDistrict: 'रोजगार जिला',
    empDepartment: 'रोजगार विभाग',
    empDesignation: 'रोजगार पदनाम',
    doj: 'कार्यग्रहण की तिथि',
    state: 'राज्य',
    retirementDate: 'सेवानिवृत्ति की तिथि',
    retirementDoc: 'सेवानिवृत्ति दस्तावेज़',
    accountNumber: 'बैंक खाता संख्या',
    ifsc: 'आईएफएससी कोड',
    bankName: 'बैंक का नाम',
    aadhaarFront: 'आधार सामने का दस्तावेज़',
    aadhaarBack: 'आधार पीछे का दस्तावेज़',
    profilePhoto: 'प्रोफाइल फोटो'
  },
  notifications: {
    title: 'सूचनाएं',
    markAllRead: 'सभी को पढ़ा हुआ चिह्नित करें',
    noNotifications: 'कोई सूचना नहीं',
    allCaughtUp: 'सब कुछ अप टू डेट है!',
    completeProfile: 'अपनी प्रोफाइल पूरी करें ({fields} फ़ील्ड्स गायब, {nominees}/2 नामांकित)',
    profileIncomplete: 'कृपया अपनी प्रोफाइल पूरी करें। {count} फ़ील्ड(स) गायब हैं।',
    justNow: 'अभी अभी',
    fieldMissing: 'कृपया अपना {field} जोड़ें',
    profileComplete: 'आपकी प्रोफाइल पूरी हो गई है! सभी विवरण अपडेट करने के लिए धन्यवाद।',
    retirementDocMissing: 'कृपया अपना पेंशनभोगी प्रोफाइल पूरा करने के लिए अपना सेवानिवृत्ति दस्तावेज़ अपलोड करें।',
    noNominees: 'कृपया अपनी प्रोफाइल पूरी करने के लिए कम से कम एक नामांकित व्यक्ति जोड़ें।',
    addSecondNominee: 'बेहतर कवरेज के लिए दूसरा नामांकित व्यक्ति जोड़ने पर विचार करें।'
  },
  errors: {
    failedLoadUsers: 'उपयोगकर्ता लोड करने में विफल'
  },
  modal: {
    completeProfile: 'अपनी प्रोफाइल पूरी करें',
    description: 'ESCT का अधिकतम लाभ उठाने के लिए, कृपया अपनी प्रोफाइल जानकारी पूरी करें:',
    missingInfo: 'गायब जानकारी',
    fieldsMissing: 'आपकी प्रोफाइल में {count} फ़ील्ड(स) पूरी करने की आवश्यकता है।',
    userType: 'उपयोगकर्ता प्रकार: {type}',
    noNominees: 'कोई नामांकित व्यक्ति नहीं जोड़ा गया',
    addNominees: 'कृपया अपनी प्रोफाइल सेटअप पूरी करने के लिए कम से कम एक नामांकित व्यक्ति जोड़ें।',
    pensionerRequirement: 'पेंशनभोगी आवश्यकता',
    retirementDocRequired: 'पेंशनभोगी के रूप में, कृपया सुनिश्चित करें कि आप अपना सेवानिवृत्ति दस्तावेज़ अपलोड करें।',
    oneTimePopup: 'यह पॉपअप केवल एक बार दिखाई देगा। आप बाद में प्रोफाइल सेक्शन से अपनी प्रोफाइल हमेशा अपडेट कर सकते हैं।',
    doLater: 'मैं बाद में करूंगा',
    completeNow: 'अभी प्रोफाइल पूरी करें'
  }
},
FORGOT_PASSWORD: {
  title: 'पासवर्ड भूल गए',
  subtitle: 'अपना पासवर्ड रीसेट करने के लिए अपना ईएचआरएमएस कोड दर्ज करें',
  labels: {
    ehrmsCode: 'ईएचआरएमएस कोड'
  },
  placeholders: {
    ehrmsCode: 'आपका ईएचआरएमएस कोड'
  },
  buttons: {
    sendResetLink: 'रीसेट लिंक भेजें',
    sending: 'भेजा जा रहा है...',
    backToLogin: 'लॉगिन पर वापस जाएं'
  },
  errors: {
    requestFailed: 'अनुरोध प्रोसेस करने में विफल। कृपया पुनः प्रयास करें।'
  }
},

RESET_PASSWORD: {
  title: 'पासवर्ड रीसेट करें',
  subtitle: 'अपना नया पासवर्ड दर्ज करें',
  labels: {
    newPassword: 'नया पासवर्ड',
    confirmPassword: 'पासवर्ड की पुष्टि करें'
  },
  placeholders: {
    newPassword: 'नया पासवर्ड दर्ज करें',
    confirmPassword: 'नए पासवर्ड की पुष्टि करें'
  },
  buttons: {
    resetPassword: 'पासवर्ड रीसेट करें',
    resetting: 'पासवर्ड रीसेट हो रहा है...',
    backToLogin: 'लॉगिन पर वापस जाएं'
  },
  success: {
    redirecting: 'लॉगिन पेज पर रीडायरेक्ट किया जा रहा है...'
  },
  errors: {
    invalidToken: 'अमान्य या गायब रीसेट टोकन।',
    invalidLinkTitle: 'अमान्य रीसेट लिंक',
    invalidLinkMessage: 'यह रीसेट लिंक अमान्य है या इसकी समय सीमा समाप्त हो गई है।',
    passwordsNotMatch: 'पासवर्ड मेल नहीं खाते।',
    passwordTooShort: 'पासवर्ड कम से कम 8 वर्ण लंबा होना चाहिए।',
    resetFailed: 'पासवर्ड रीसेट करने में विफल। कृपया पुनः प्रयास करें।'
  }
},
LOGIN: {
  title: 'वापसी पर स्वागत है!',
  subtitle: 'अपने डैशबोर्ड तक पहुंचने के लिए साइन इन करें।',
  labels: {
    ehrmsCode: 'ईएचआरएमएस कोड',
    password: 'पासवर्ड'
  },
  placeholders: {
    ehrmsCode: 'आपका ईएचआरएमएस कोड',
    password: 'आपका पासवर्ड'
  },
  links: {
    forgotPassword: 'पासवर्ड भूल गए?'
  },
  buttons: {
    login: 'लॉगिन',
    loggingIn: 'लॉगिन हो रहा है...'
  },
  errors: {
    loginFailed: 'लॉगिन विफल। कृपया अपनी क्रेडेंशियल्स जांचें।'
  }
},
LEGAL: {
  subtitle: 'हमारे मिशन, नीतियों और प्रतिबद्धताओं के बारे में व्यापक विवरण।',
  tabs: {
    about: 'हमारे बारे में',
    privacy: 'गोपनीयता',
    terms: 'नियम और शर्तें'
  },
  about: {
    title: 'ESCT के बारे में',
    paragraph1: 'ESCT (एम्प्लॉयी सेल्फ केयर टीम) एक पहल है जिसे सरकारी कर्मचारियों और पेंशनभोगियों को आवश्यकता के समय समय पर और पारदर्शी वित्तीय सहायता प्रदान करने के लिए डिजाइन किया गया है। हमारा मुख्य मिशन दया पर आधारित एक समुदाय को बढ़ावा देना है, यह सुनिश्चित करते हुए कि जिन लोगों ने अपनी सेवा समर्पित की है, उन्हें हमेशा मदद उपलब्ध रहे।',
    paragraph2: 'एक संरचित और सत्यापित प्रणाली के माध्यम से, हम विशिष्ट दावा श्रेणियों जैसे **सेवानिवृत्ति**, **सेवा के बाद मृत्यु**, और **सेवा के दौरान मृत्यु** के लिए दान की सुविधा प्रदान करते हैं। हमारे प्लेटफॉर्म पर हर क्रिया, उपयोगकर्ता पंजीकरण से लेकर लाभार्थी दावों तक, हमारे समुदाय की अखंडता और विश्वास को बनाए रखने के लिए एक कठोर सत्यापन प्रक्रिया के अधीन है।',
    paragraph3: 'हम मानते हैं कि एक छोटा, लगातार योगदान एक ऐतिहासिक अंतर ला सकता है। हमारा प्लेटफॉर्म सदस्यों को अपने साथियों को आसानी से योगदान देने और उनके समर्थन के प्रत्यक्ष प्रभाव को देखने के लिए सशक्त बनाता है, जिससे दया एक सरल, मूर्त क्रिया बन जाती है।'
  },
  privacy: {
    title: 'गोपनीयता नीति',
    intro: 'हम आपकी गोपनीयता की सुरक्षा के लिए प्रतिबद्ध हैं। यह नीति बताती है कि हम आपकी व्यक्तिगत जानकारी कैसे एकत्र करते हैं, उपयोग करते हैं और सुरक्षित रखते हैं।',
    dataCollection: {
      title: 'डेटा संग्रह और सत्यापन',
      content: 'पंजीकरण के दौरान, हम आपका ईएचआरएमएस/पेंशनभोगी नंबर एकत्र करते हैं। इस जानकारी का उपयोग तत्काल सत्यापन के लिए किया जाता है एक एकीकृत एमएल मॉडल के माध्यम से जो आपका नाम, जन्म तिथि और अन्य रोजगार विवरण स्वचालित रूप से भरता है। ये विवरण केवल-पढ़ने के लिए हैं और पहचान धोखाधड़ी को रोकने और डेटा अखंडता सुनिश्चित करने के लिए सत्यापन के बाद इन्हें बदला नहीं जा सकता है।'
    },
    dataUsage: {
      title: 'जानकारी का उपयोग',
      content: 'आपके व्यक्तिगत डेटा का उपयोग विशेष रूप से सेवा वितरण के लिए किया जाता है, जिसमें दान प्रसंस्करण, दावों का प्रबंधन और प्रासंगिक सूचनाएं भेजना शामिल है। हम आपकी व्यक्तिगत जानकारी तीसरे पक्ष के साथ साझा नहीं करते हैं, सिवाय सेवा कार्यक्षमता (जैसे, भुगतान प्रसंस्करण के लिए रेजरपे) या कानूनी अनुपालन के लिए आवश्यक होने पर।'
    },
    security: {
      title: 'सुरक्षा',
      content: 'हम आपके डेटा की सुरक्षा के लिए उद्योग-मानक सुरक्षा उपायों का उपयोग करते हैं। आपके बैंक विवरण और अन्य संवेदनशील जानकारी को उच्चतम स्तर की एन्क्रिप्शन के साथ संभाला जाता है और उस तरीके से संग्रहीत नहीं किया जाता है जो आपकी सुरक्षा से समझौता करता हो।'
    }
  },
  terms: {
    title: 'नियम और शर्तें',
    intro: 'ESCT प्लेटफॉर्म का उपयोग करके, आप निम्नलिखित शर्तों से सहमत होते हैं।',
    membership: {
      title: 'सदस्यता और दान',
      content: 'सक्रिय खाता बनाए रखने के लिए **₹51** की वार्षिक सदस्यता शुल्क आवश्यक है। सदस्य मासिक दान दायित्व के भी अधीन हैं, जो हमारे समुदाय-संचालित समर्थन मॉडल का एक महत्वपूर्ण हिस्सा है। इन दायित्वों को पूरा करने में विफलता के परिणामस्वरूप खाता निलंबन हो सकता है।'
    },
    eligibility: {
      title: 'दावा पात्रता',
      content: 'लाभार्थी के रूप में आवेदन करने की पात्रता लगातार भागीदारी पर निर्भर करती है। दावा के लिए आवेदन करने के पात्र होने के लिए आपको कम से कम छह महीने की अवधि के लिए अपना अनिवार्य मासिक दान पूरा करना होगा। सभी दावे हमारी ग्राउंड और एडमिन टीमों द्वारा बहु-चरणीय सत्यापन प्रक्रिया के अधीन हैं।'
    },
    refunds: {
      title: 'धनवापसी',
      content: 'ESCT प्लेटफॉर्म के माध्यम से किए गए सभी दान गैर-वापसी योग्य हैं। दान एक लाभार्थी के लिए एक स्वैच्छिक योगदान हैं और लेनदेन पूरा होने के बाद इन्हें वापस नहीं लिया जा सकता है।'
    }
  }
}
};