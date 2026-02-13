import React from 'react';

const ChatTerms = () => {
  const Section = ({ title, children }) => (
    <section className="mb-8">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="leading-relaxed space-y-4">{children}</div>
    </section>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-3xl font-extrabold mb-8 pb-4">
            익명 채팅 이용 약관
          </h1>
          <div className="prose max-w-none">
            <Section title="제1조 (목적)">
              <p>
                본 약관은 쥬스고블린(이하 &quot;회사&quot;라 함)이 제공하는 익명 채팅 서비스(이하 &quot;서비스&quot;라 함)의 이용과 관련하여 회사와 이용자의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
              </p>
            </Section>

            <Section title="제2조 (용어의 정의)">
              <p>서비스라 함은 회사가 제공하는 &apos;쥬스고블린&apos; 실시간 익명 대화 및 관련 제반 서비스를 의미합니다.</p>
              <p>이용자라 함은 본 약관에 따라 회사가 제공하는 서비스를 이용하는 자를 의미합니다.</p>
            </Section>

            <Section title="제3조 (익명성 및 개인정보 보호)">
              <p>본 서비스는 익명성을 기반으로 하며, 별도의 회원가입 절차 없이 이용할 수 있습니다.</p>
              <p>
                회사는 원칙적으로 이용자의 개인정보를 수집하지 않습니다. 단, 서비스 부정이용 방지 및 법적 분쟁 해결, 수사기관의 협조 요청 시 IP 주소, 기기 정보, 접속 로그 등이 관련 법령에 따라 일정 기간 보관될 수 있습니다.
              </p>
              <p>
                이용자가 채팅 과정에서 스스로 공개한 개인정보(전화번호, SNS ID, 사진 등)로 인해 발생하는 문제에 대해서는 회사가 책임을 지지 않습니다.
              </p>
            </Section>

            <Section title="제4조 (이용자의 의무 및 금지 행위)">
              <p>
                이용자는 본 서비스를 이용함에 있어 다음 각 호의 행위를 하여서는 안 되며, 이를 위반할 경우 회사는 즉시 서비스 이용 제한, 접속 차단 및 법적 조치를 취할 수 있습니다.
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>불법 정보 유통: 성매매 알선, 음란물 유포, 도박, 마약 거래 등 현행법에 위반되는 내용을 전송하는 행위</li>
                <li>타인 비방 및 명예훼손: 욕설, 비하 발언, 모욕, 협박, 스토킹 등 타인에게 공포심이나 불안감을 유발하는 행위</li>
                <li>개인정보 침해: 타인의 개인정보를 동의 없이 수집, 저장, 공개하거나 본인의 개인정보를 무분별하게 배포하는 행위</li>
                <li>광고 및 홍보: 영리 목적의 광고성 정보를 반복적으로 전송하거나 도배하는 행위</li>
                <li>시스템 방해: 해킹, 바이러스 유포, 서버 공격 등 서비스의 안정적인 운영을 방해하는 행위</li>
                <li>청소년 유해 활동: 아동·청소년을 대상으로 한 성적 대화 시도 및 유해 정보를 제공하는 행위</li>
              </ul>
            </Section>

            <Section title="제5조 (서비스의 변경 및 중단)">
              <p>
                회사는 운영상, 기술상의 필요에 따라 제공하고 있는 서비스의 전부 또는 일부를 수정하거나 중단할 수 있습니다.
              </p>
              <p>
                무료로 제공되는 서비스의 일부 또는 전부를 회사의 정책 및 운영의 필요상 수정, 중단, 변경할 수 있으며, 이에 대하여 관련 법령에 특별한 규정이 없는 한 이용자에게 별도의 보상을 하지 않습니다.
              </p>
            </Section>

            <Section title="제6조 (책임의 한계 및 면책)">
              <p>
                회사는 이용자 간에 이루어지는 대화 내용에 관여하지 않으며, 이용자가 서비스를 통해 주고받은 정보의 정확성, 신뢰성 등에 대하여 책임을 지지 않습니다.
              </p>
              <p>
                회사는 천재지변, 통신망 장애 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.
              </p>
              <p>
                이용자 간 또는 이용자와 제3자 상호 간에 서비스를 매개로 하여 발생한 분쟁에 대해 회사는 개입할 의무가 없으며, 이로 인한 손해를 배상할 책임도 없습니다.
              </p>
            </Section>

            <Section title="제7조 (준거법)">
              <p>회사와 이용자 간에 제기된 소송은 대한민국 법을 준거법으로 합니다.</p>
            </Section>

            <div className="mt-12 pt-8 border-t">
              <p className="font-bold">부칙</p>
              <p className="">본 약관은 2026년 2월 14일부터 적용됩니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatTerms;
