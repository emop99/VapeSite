import React from 'react';

const PrivacyPolicy = () => {
  const Section = ({title, children}) => (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
      <div className="text-gray-700 leading-relaxed space-y-4">{children}</div>
    </section>
  );

  const ListItem = ({children}) => <li className="mb-2">{children}</li>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-extrabold mb-8 text-gray-900 border-b pb-4">개인정보 처리 방침</h1>
        <div className="prose max-w-none">
          <p className="mb-4">쥬스고블린(이하 '회사')은 귀하의 개인정보를 매우 중요하게 생각하며, '정보통신망 이용촉진 및 정보보호'에 관한 법률을 준수하고 있습니다. 회사는 개인정보처리방침을 통하여 귀하께서 제공하시는 개인정보가 어떠한 용도와 방식으로 이용되고 있으며, 개인정보보호를 위해
            어떠한 조치가 취해지고 있는지 알려드립니다.</p>

          <Section title="1. 수집하는 개인정보 항목">
            <p>회사는 회원가입, 상담, 서비스 신청 등등을 위해 아래와 같은 개인정보를 수집하고 있습니다.</p>
            <ul className="list-disc list-inside space-y-2">
              <ListItem><strong>수집항목:</strong> 이름, 로그인ID, 비밀번호, 이메일</ListItem>
              <ListItem><strong>개인정보 수집방법:</strong> 홈페이지(회원가입), 서면양식</ListItem>
            </ul>
          </Section>

          <Section title="2. 개인정보의 수집 및 이용목적">
            <p>회사는 수집한 개인정보를 다음의 목적을 위해 활용합니다.</p>
            <ul className="list-disc list-inside space-y-2">
              <ListItem>회원 관리: 회원제 서비스 이용에 따른 본인확인, 개인 식별, 불량회원의 부정 이용 방지와 비인가 사용 방지, 가입 의사 확인</ListItem>
            </ul>
          </Section>

          <Section title="3. 개인정보의 보유 및 이용기간">
            <p>원칙적으로, 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 관계법령의 규정에 의하여 보존할 필요가 있는 경우 회사는 아래와 같이 관계법령에서 정한 일정한 기간 동안 회원정보를 보관합니다.</p>
            <ul className="list-disc list-inside space-y-2">
              <ListItem><strong>보존 항목:</strong> 이름, 로그인ID, 비밀번호, 이메일</ListItem>
              <ListItem><strong>보존 근거:</strong> 전자상거래 등에서의 소비자보호에 관한 법률</ListItem>
              <ListItem><strong>보존 기간:</strong> 5년</ListItem>
            </ul>
          </Section>

          <p className="text-sm text-gray-500 mt-8">이 개인정보처리방침은 2025년 8월 13일부터 적용됩니다.</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
